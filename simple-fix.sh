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

echo "Creating simple fix script..."
cat > simple_fix.sh << 'EOF'
#!/bin/bash

# Stop Nginx (to ensure clean restart)
echo "Stopping Nginx..."
sudo systemctl stop nginx

# Create an extremely simple Express server
echo "Creating simple Express server..."
cat > /var/www/dsphoto-backend/server.js << 'SERVER_JS'
const express = require('express');
const app = express();
const PORT = 8000;

// Simple logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Sample data endpoint
app.get('/images', (req, res) => {
  const sampleData = [
    { id: 1, title: 'Sample Image 1', url: 'https://example.com/image1.jpg' },
    { id: 2, title: 'Sample Image 2', url: 'https://example.com/image2.jpg' }
  ];
  res.json(sampleData);
});

// Handle OPTIONS requests for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.send(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
SERVER_JS

# Create a minimal Nginx configuration
echo "Creating minimal Nginx configuration..."
sudo bash -c 'cat > /etc/nginx/sites-available/dsphoto-api << EOL
server {
    listen 80;
    server_name api.fotods.no;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOL'

# Remove any conflicting configs
echo "Removing potentially conflicting configurations..."
cd /etc/nginx/sites-enabled/
sudo rm -f dsphoto-api dsphoto-backend dsphoto-test

# Enable the new configuration
echo "Enabling new configuration..."
sudo ln -sf /etc/nginx/sites-available/dsphoto-api /etc/nginx/sites-enabled/

# Test configuration
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "Nginx configuration test failed. Exiting."
    exit 1
fi

# Restart services
echo "Restarting Node.js application..."
cd /var/www/dsphoto-backend
pm2 stop all
pm2 start server.js --name dsphoto-backend

echo "Starting Nginx..."
sudo systemctl start nginx

# Wait a bit for services to fully start
sleep 3

# Test the API
echo "Testing API health endpoint..."
echo "Local test:"
curl -v http://localhost:8000/health
echo ""
echo "Nginx test:"
curl -v http://api.fotods.no/health

# Check logs for any issues
echo "Checking Nginx error log for recent issues:"
sudo tail -n 20 /var/log/nginx/error.log

echo "Checking Nginx access log:"
sudo tail -n 20 /var/log/nginx/access.log

echo "Simple fix completed."
EOF

echo "Uploading and executing simple fix script..."
chmod +x simple_fix.sh
scp -i $PEM_FILE simple_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/simple_fix.sh && sudo /home/$EC2_USER/simple_fix.sh"

# Clean up
rm -f simple_fix.sh
echo "Simple fix completed." 