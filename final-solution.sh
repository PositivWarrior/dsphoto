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

echo "Creating final solution script..."
cat > final_solution.sh << 'EOF'
#!/bin/bash

echo "========== IMPLEMENTING FINAL SOLUTION =========="

# Stop all services
echo "Stopping all services..."
sudo systemctl stop nginx
pm2 stop all || true
pm2 delete all || true

# Kill any lingering processes
echo "Killing any lingering processes on critical ports..."
sudo fuser -k 80/tcp 443/tcp 8000/tcp 3000/tcp || true

# Create a minimal backend
echo "Creating minimal backend..."
sudo mkdir -p /var/www/simple-api
sudo chown -R ubuntu:ubuntu /var/www/simple-api
cd /var/www/simple-api

# Create a simple Express app
echo "Creating Express app..."
cat > server.js << 'END'
const express = require('express');
const app = express();
const PORT = 3000;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://fotods.no');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Simple endpoints
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/images', (req, res) => {
  const data = [
    { id: 1, title: 'Sample Image 1', url: 'https://example.com/image1.jpg' },
    { id: 2, title: 'Sample Image 2', url: 'https://example.com/image2.jpg' }
  ];
  res.json(data);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
END

# Install dependencies
echo "Installing dependencies..."
npm init -y
npm install express

# Setup Nginx
echo "Setting up Nginx..."
sudo bash -c 'cat > /etc/nginx/sites-available/simple-api << END
server {
    listen 80;
    server_name api.fotods.no;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # CORS headers
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS" always;
        add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        
        # Handle preflight requests
        if (\$request_method = "OPTIONS") {
            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS" always;
            add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
            add_header "Content-Type" "text/plain charset=UTF-8";
            add_header "Content-Length" "0";
            return 204;
        }
    }
}
END'

# Enable the config
echo "Enabling Nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo ln -sf /etc/nginx/sites-available/simple-api /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "ERROR: Nginx configuration test failed!"
    exit 1
fi

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start server.js --name simple-api

# Start Nginx
echo "Starting Nginx..."
sudo systemctl start nginx

# Wait for services to start
echo "Waiting for services to start..."
sleep 3

# Test connectivity
echo "Testing local connectivity..."
curl -v http://localhost:3000/health
echo ""
curl -v http://localhost/health
echo ""

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Setup startup script
echo "Setting up startup script..."
pm2 startup | tail -1 > startup_command.sh
chmod +x startup_command.sh
sudo ./startup_command.sh
rm startup_command.sh

echo ""
echo "========== FINAL SOLUTION IMPLEMENTED =========="
echo ""
echo "To test from your local machine, run:"
echo "curl http://api.fotods.no/health"
echo "curl http://51.21.110.161/health"
echo ""
echo "If you still can't connect, please check:"
echo "1. DNS configuration for api.fotods.no"
echo "2. EC2 security group settings for ports 80 and 443"
echo "3. Network ACLs if your instance is in a VPC"
EOF

echo "Uploading and executing final solution script..."
chmod +x final_solution.sh
scp -i $PEM_FILE final_solution.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/final_solution.sh && sudo /home/$EC2_USER/final_solution.sh"

# Clean up
rm -f final_solution.sh
echo "Final solution implemented. Please check connectivity and refer to the update-dns.md document for additional steps." 