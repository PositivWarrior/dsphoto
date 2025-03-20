#!/bin/bash

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "ERROR: PEM file not found. Checking parent directory..."
    PEM_FILE="../$PEM_FILE"
    if [ ! -f "$PEM_FILE" ]; then
        echo "ERROR: PEM file not found in parent directory either. Please provide the correct path."
        exit 1
    fi
fi

echo "Creating server fix script..."
cat > server_fix.sh << 'EOF'
#!/bin/bash

echo "=== Checking Express.js server ==="
cd /var/www/dsphoto-backend

# Backup the current server.js
echo "Backing up original server.js..."
cp server.js server.js.backup

# Create a minimal server.js to test basic functionality
echo "Creating minimal server.js to verify setup..."
cat > server.js.minimal << 'SERVER_JS'
import express from 'express';
const app = express();
const port = 8000;

// Basic CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://fotods.no');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Express server is working!' });
});

// Check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
SERVER_JS

# Stop current server
echo "Stopping current server..."
pm2 stop dsphoto-backend

# Test minimal server
echo "Testing minimal server..."
cp server.js.minimal server.js
pm2 start server.js --name minimal-test

# Wait for server to start
sleep 5

# Test if minimal server is working
echo "Checking if minimal server is responding..."
curl -s http://localhost:8000/test
curl -s http://localhost:8000/health

# Install missing dependencies if needed
echo "Installing required dependencies..."
npm list express || npm install express
npm list cors || npm install cors
npm list body-parser || npm install body-parser
npm list dotenv || npm install dotenv

# Restore original server with fixes
echo "Restoring original server with fixes..."
cp server.js.backup server.js

# Fix any potential issues with the original server.js
echo "Applying fixes to server.js..."

# Fix 1: Ensure proper imports
if grep -q "import" server.js; then
  # ES Modules format - update imports if needed
  if ! grep -q "express from 'express'" server.js; then
    sed -i '1i import express from "express";' server.js
  fi
  
  if ! grep -q "cors" server.js; then
    sed -i '2i import cors from "cors";' server.js
  fi
else
  # CommonJS format
  if ! grep -q "require('express')" server.js; then
    sed -i '1i const express = require("express");' server.js
  fi
  
  if ! grep -q "require('cors')" server.js; then
    sed -i '2i const cors = require("cors");' server.js
  fi
fi

# Fix 2: Ensure Express app is created
if ! grep -q "const app = express()" server.js && ! grep -q "app = express()" server.js; then
  sed -i '/express/a const app = express();' server.js
fi

# Fix 3: Ensure CORS middleware
if ! grep -q "app.use(cors" server.js; then
  if grep -q "import" server.js; then
    # ES Modules
    sed -i '/app = express/a app.use(cors({ origin: "https://fotods.no", credentials: true }));' server.js
  else
    # CommonJS
    sed -i '/app = express/a app.use(cors({ origin: "https://fotods.no", credentials: true }));' server.js
  fi
fi

# Fix 4: Ensure proper port is set
if ! grep -q "port = 8000" server.js && ! grep -q "PORT = 8000" server.js; then
  sed -i '/app = express/a const port = process.env.PORT || 8000;' server.js
fi

# Fix 5: Ensure server is started
if ! grep -q "app.listen" server.js; then
  echo '
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});' >> server.js
fi

# Restart the original server with fixes
echo "Restarting original server with fixes..."
pm2 stop minimal-test
pm2 start server.js --name dsphoto-backend

# Wait for server to start
sleep 5

# Check if server is running
echo "Checking if server is responding..."
curl -s http://localhost:8000/health || echo "Server health check failed"

# Verify CORS configuration
echo "Verifying CORS configuration..."
curl -s -I -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: GET" -X OPTIONS http://localhost:8000/

# Restart Nginx for good measure
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Final verification through Nginx
echo "Final verification through Nginx..."
curl -s -I -H "Origin: https://fotods.no" https://api.fotods.no/health

echo "Server fix completed!"
EOF

echo "Uploading and executing server fix script..."
chmod +x server_fix.sh
scp -i $PEM_FILE server_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/server_fix.sh && sudo /home/$EC2_USER/server_fix.sh"

# Clean up
rm -f server_fix.sh
echo "Server fix completed." 