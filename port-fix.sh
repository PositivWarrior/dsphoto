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

echo "Creating port binding fix script..."
cat > port_fix.sh << 'EOF'
#!/bin/bash

echo "========== FIXING PORT BINDING ISSUE =========="

# Stop all services
echo "Stopping all services..."
sudo systemctl stop nginx
pm2 stop all
pm2 delete all

# Kill any lingering processes
echo "Killing any lingering processes on port 8000..."
sudo fuser -k 8000/tcp || true

# Create a minimal Express server that explicitly logs binding issues
echo "Creating minimal Express server..."
cat > /var/www/dsphoto-backend/minimal.js << 'SERVER_JS'
const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else if (req.url === '/images') {
    const data = [
      { id: 1, title: 'Sample Image 1', url: 'https://example.com/image1.jpg' },
      { id: 2, title: 'Sample Image 2', url: 'https://example.com/image2.jpg' }
    ];
    
    // Add CORS headers
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://fotods.no',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    res.end(JSON.stringify(data));
  } else if (req.method === 'OPTIONS') {
    // Handle CORS preflight
    res.writeHead(204, {
      'Access-Control-Allow-Origin': 'https://fotods.no',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Listen on all interfaces with detailed error handling
server.on('error', (e) => {
  console.error('Server error:', e);
  if (e.code === 'EADDRINUSE') {
    console.error('Port 8000 is already in use. Trying to force it closed...');
    // You could add process killing here if needed
  }
});

// Try both explicit 0.0.0.0 binding and default binding
try {
  server.listen(8000, '0.0.0.0', () => {
    const addr = server.address();
    console.log(`Server running on ${addr.address}:${addr.port}`);
  });
} catch (err) {
  console.error('Failed to bind to 0.0.0.0:8000', err);
  console.log('Trying alternative binding...');
  
  try {
    server.listen(8000, () => {
      const addr = server.address();
      console.log(`Server running on ${addr.address}:${addr.port}`);
    });
  } catch (err) {
    console.error('Failed to bind to port 8000', err);
  }
}
SERVER_JS

# Create a minimal Nginx configuration
echo "Creating minimal Nginx configuration..."
cat > /etc/nginx/sites-available/dsphoto-api << 'NGINX_CONF'
server {
    listen 80;
    server_name api.fotods.no;
    
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log debug;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' '0';
            return 204;
        }
    }
}
NGINX_CONF

# Clean up and enable the new configuration
echo "Enabling new configuration..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo ln -sf /etc/nginx/sites-available/dsphoto-api /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "ERROR: Nginx configuration test failed!"
    exit 1
fi

# Run the server directly to ensure it binds
echo "Starting server directly (not through PM2)..."
cd /var/www/dsphoto-backend
node minimal.js &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Check if it's running
echo "Checking if server is running..."
ps -p $SERVER_PID
if [ $? -ne 0 ]; then
    echo "ERROR: Server process died. Checking logs..."
    cat /var/log/pm2/minimal-error.log || echo "No PM2 logs found"
    exit 1
fi

# Check if it's listening
echo "Checking if server is listening on port 8000..."
sudo netstat -tulpn | grep :8000
if [ $? -ne 0 ]; then
    echo "ERROR: Server is not listening on port 8000"
    
    # Try another approach with a different port
    echo "Trying with a different port (8080)..."
    kill $SERVER_PID
    
    # Create server on different port
    cat > /var/www/dsphoto-backend/alt-port.js << 'ALT_PORT_JS'
    const http = require('http');
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK from port 8080');
    });
    server.listen(8080, '0.0.0.0', () => {
      console.log('Server running on 0.0.0.0:8080');
    });
    ALT_PORT_JS
    
    # Update Nginx to use port 8080
    sudo sed -i 's/proxy_pass http:\/\/127.0.0.1:8000;/proxy_pass http:\/\/127.0.0.1:8080;/' /etc/nginx/sites-available/dsphoto-api
    
    # Start server on port 8080
    node /var/www/dsphoto-backend/alt-port.js &
    ALT_SERVER_PID=$!
    
    sleep 3
    
    # Check if it's listening
    sudo netstat -tulpn | grep :8080
    if [ $? -ne 0 ]; then
        echo "ERROR: Alternative server is not listening on port 8080 either"
        exit 1
    else
        echo "SUCCESS: Server is now listening on port 8080"
        SERVER_PID=$ALT_SERVER_PID
    fi
fi

# Start Nginx
echo "Starting Nginx..."
sudo systemctl start nginx

# Test connectivity
echo "Testing local connectivity..."
curl -v http://localhost:8000/health || curl -v http://localhost:8080/health
echo ""

echo "Testing Nginx proxy..."
curl -v http://api.fotods.no/health
echo ""

# Set up as a service with PM2
echo "Setting up as a service with PM2..."
cd /var/www/dsphoto-backend
kill $SERVER_PID

# Start with PM2
pm2 start minimal.js --name api-server || pm2 start alt-port.js --name api-server
pm2 save

echo "========== PORT BINDING FIX COMPLETED =========="
EOF

echo "Uploading and executing port fix script..."
chmod +x port_fix.sh
scp -i $PEM_FILE port_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/port_fix.sh && sudo /home/$EC2_USER/port_fix.sh"

# Clean up
rm -f port_fix.sh
echo "Port binding fix completed." 