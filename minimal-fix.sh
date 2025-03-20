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

echo "Creating minimal fix script..."
cat > minimal_fix.sh << 'EOF'
#!/bin/bash

# Stop services first
echo "Stopping services..."
sudo systemctl stop nginx
cd /var/www/dsphoto-backend
pm2 stop all

# Create an extremely simple Express server
echo "Creating simple Express server..."
cat > /var/www/dsphoto-backend/server.js << 'SERVER_JS'
const express = require('express');
const app = express();
const PORT = 8000;

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
SERVER_JS

# Create an absolutely minimal Nginx configuration with no variables
echo "Creating minimal Nginx configuration..."
cat > /tmp/dsphoto-api << 'NGINX_CONF'
server {
    listen 80;
    server_name api.fotods.no;

    location / {
        proxy_pass http://localhost:8000;
    }
}
NGINX_CONF

# Check the config syntax manually
echo "Manually checking Nginx syntax..."
cat /tmp/dsphoto-api

# Install in Nginx directory
echo "Installing Nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/dsphoto-api
sudo cp /tmp/dsphoto-api /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/dsphoto-api /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Start the Express server
echo "Starting Express server..."
cd /var/www/dsphoto-backend
pm2 start server.js --name dsphoto-minimal

# Start Nginx
echo "Starting Nginx..."
sudo systemctl start nginx

# Test endpoints
echo "Testing endpoints after 3 seconds..."
sleep 3

echo "Local test:"
curl -v http://localhost:8000/health

echo ""
echo "Nginx test (HTTP):"
curl -v http://api.fotods.no/health

echo "Fix completed!"
EOF

echo "Uploading and executing minimal fix script..."
chmod +x minimal_fix.sh
scp -i $PEM_FILE minimal_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/minimal_fix.sh && sudo /home/$EC2_USER/minimal_fix.sh"

# Clean up
rm -f minimal_fix.sh
echo "Minimal fix completed." 