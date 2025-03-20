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

echo "Creating SSL fix script..."
cat > ssl_fix.sh << 'EOF'
#!/bin/bash

echo "========== CONFIGURING API WITH SSL =========="

# Stop all services
echo "Stopping all services..."
sudo systemctl stop nginx
pm2 stop all

# Create a properly configured Express server with CORS
echo "Creating Express server with CORS configuration..."
cat > /var/www/dsphoto-backend/server.js << 'SERVER_JS'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

// Configure CORS
const corsOptions = {
  origin: ['https://fotods.no', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Debug logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
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
  console.log('Images requested');
  try {
    const imagesData = fs.readFileSync(imagesJsonPath, 'utf8');
    res.json(JSON.parse(imagesData));
  } catch (error) {
    console.error('Error reading image data:', error);
    res.status(500).json({ error: 'Failed to read image data' });
  }
});

// Listen on all interfaces
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

// Handle server errors
server.on('error', (e) => {
  console.error('Server startup error:', e);
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free up the port and try again.`);
  }
});
SERVER_JS

# Check for existing SSL certificates for api.fotods.no
echo "Checking for existing SSL certificates..."
if [ -d "/etc/letsencrypt/live/api.fotods.no" ]; then
    echo "Found existing certificates for api.fotods.no"
    SSL_CERT="/etc/letsencrypt/live/api.fotods.no/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/api.fotods.no/privkey.pem"
elif [ -d "/etc/letsencrypt/live/fotods.no" ]; then
    echo "Using existing certificates for fotods.no (main domain)"
    SSL_CERT="/etc/letsencrypt/live/fotods.no/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/fotods.no/privkey.pem"
else
    echo "No certificates found, attempting to obtain one..."
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtain certificate
    echo "Obtaining certificate for api.fotods.no..."
    sudo certbot --nginx -d api.fotods.no --non-interactive --agree-tos --email webmaster@fotods.no
    
    if [ $? -ne 0 ]; then
        echo "Failed to obtain certificate. Using self-signed certificate instead."
        # Create self-signed certificate
        sudo mkdir -p /etc/nginx/ssl
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/nginx/ssl/api.fotods.no.key \
            -out /etc/nginx/ssl/api.fotods.no.crt \
            -subj "/CN=api.fotods.no"
        SSL_CERT="/etc/nginx/ssl/api.fotods.no.crt"
        SSL_KEY="/etc/nginx/ssl/api.fotods.no.key"
    else
        SSL_CERT="/etc/letsencrypt/live/api.fotods.no/fullchain.pem"
        SSL_KEY="/etc/letsencrypt/live/api.fotods.no/privkey.pem"
    fi
fi

# Create Nginx configuration with SSL
echo "Creating Nginx configuration with SSL..."
cat > /etc/nginx/sites-available/dsphoto-api << NGINX_CONF
server {
    listen 80;
    server_name api.fotods.no;
    
    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.fotods.no;
    
    # SSL configuration
    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        # Proxy to Node.js server
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
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

# Start the Express server
echo "Starting Express server..."
cd /var/www/dsphoto-backend
pm2 delete all
pm2 start server.js --name dsphoto-api

# Start Nginx
echo "Starting Nginx..."
sudo systemctl start nginx

# Wait for services to start
sleep 5

# Test HTTPS endpoint
echo "Testing HTTPS API endpoint..."
curl -k https://api.fotods.no/health

# Test HTTPS with CORS headers
echo ""
echo "Testing HTTPS API with CORS headers..."
curl -k -H "Origin: https://fotods.no" https://api.fotods.no/images

# Save PM2 configuration
echo ""
echo "Saving PM2 configuration..."
pm2 save

echo "========== SSL CONFIGURATION COMPLETED =========="
EOF

echo "Uploading and executing SSL fix script..."
chmod +x ssl_fix.sh
scp -i $PEM_FILE ssl_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/ssl_fix.sh && sudo /home/$EC2_USER/ssl_fix.sh"

# Clean up
rm -f ssl_fix.sh
echo "SSL configuration completed." 