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

echo "Creating final fix script..."
cat > final_fix.sh << 'EOF'
#!/bin/bash

echo "========== APPLYING FINAL FIX =========="

# Stop all services
echo "Stopping all services..."
sudo systemctl stop nginx
pm2 stop all
pm2 delete all

# Check for any processes using port 8000
echo "Checking for processes using port 8000..."
sudo lsof -i :8000
if [ $? -eq 0 ]; then
    echo "Killing processes using port 8000..."
    sudo kill $(sudo lsof -t -i:8000)
fi

# Create a new Express server with proper binding
echo "Creating proper Express server..."
cat > /var/www/dsphoto-backend/server.js << 'SERVER_JS'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

// Configure CORS
const corsOptions = {
  origin: 'https://fotods.no',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Debug logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create sample data file if it doesn't exist
const imagesJsonPath = path.join(dataDir, 'images.json');
if (!fs.existsSync(imagesJsonPath)) {
  const sampleData = [
    { id: 1, title: 'Sample Image 1', url: 'https://example.com/image1.jpg' },
    { id: 2, title: 'Sample Image 2', url: 'https://example.com/image2.jpg' },
  ];
  fs.writeFileSync(imagesJsonPath, JSON.stringify(sampleData, null, 2));
}

// Images data endpoint
app.get('/images', (req, res) => {
  try {
    const imagesData = fs.readFileSync(imagesJsonPath, 'utf8');
    res.json(JSON.parse(imagesData));
  } catch (error) {
    console.error('Error reading image data:', error);
    res.status(500).json({ error: 'Failed to read image data' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Server error');
});

// Explicitly listen on all interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
SERVER_JS

# Fix file permissions
echo "Setting correct file permissions..."
sudo chown -R www-data:www-data /var/www/dsphoto-backend

# Start the Express server with PM2
echo "Starting Express server with PM2..."
cd /var/www/dsphoto-backend
pm2 start server.js --name dsphoto-api

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Test server locally
echo "Testing local Express server..."
curl -v http://localhost:8000/health
if [ $? -ne 0 ]; then
    echo "ERROR: Local Express server is not responding!"
    echo "Checking PM2 logs..."
    pm2 logs --lines 20
    exit 1
fi

# Create Nginx configuration
echo "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/dsphoto-api > /dev/null << 'NGINX_CONF'
server {
    listen 80;
    server_name api.fotods.no;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' '0';
            return 204;
        }
    }
}
NGINX_CONF

# Clean up Nginx sites-enabled and enable our configuration
echo "Enabling Nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo ln -sf /etc/nginx/sites-available/dsphoto-api /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "ERROR: Nginx configuration test failed!"
    exit 1
fi

# Start Nginx
echo "Starting Nginx..."
sudo systemctl start nginx

# Test Nginx proxy
echo "Testing Nginx proxy..."
curl -v http://api.fotods.no/health

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

echo "========== FINAL FIX COMPLETED =========="
EOF

echo "Uploading and executing final fix script..."
chmod +x final_fix.sh
scp -i $PEM_FILE final_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/final_fix.sh && sudo /home/$EC2_USER/final_fix.sh"

# Clean up
rm -f final_fix.sh
echo "Final fix completed." 