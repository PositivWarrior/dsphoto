#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="../fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Create fixed Nginx configuration with proper CORS headers
cat > fixed-nginx.conf << 'EOF'
server {
    listen 80;
    server_name api.fotods.no;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.fotods.no;
    
    # Increase client body size limit for large uploads
    client_max_body_size 50M;
    
    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OPTIONS method handler for preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '1728000' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' '0';
        return 204;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for non-OPTIONS requests
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Proxy CORS headers from the application server
        proxy_pass_header Access-Control-Allow-Origin;
        proxy_pass_header Access-Control-Allow-Methods;
        proxy_pass_header Access-Control-Allow-Headers; 
        proxy_pass_header Access-Control-Allow-Credentials;
    }
    
    location /assets/ {
        alias /var/www/dsphoto-backend/assets/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Create server fix script
cat > server-cors-fix.sh << 'EOF'
#!/bin/bash

# Install the more_headers module if not already installed
if ! dpkg -l | grep -q nginx-module-headers-more; then
    sudo apt-get update
    sudo apt-get install -y nginx-module-headers-more
fi

# Check if headers_more module is loaded
if ! grep -q "load_module.*headers-more" /etc/nginx/nginx.conf; then
    # Add the module at the beginning of the file
    sudo sed -i '1iload_module modules/ngx_http_headers_more_filter_module.so;' /etc/nginx/nginx.conf
fi

# Apply the fixed configuration
sudo cp /home/ubuntu/fixed-nginx.conf /etc/nginx/sites-available/dsphoto-backend

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "Nginx configuration updated and service restarted."
else
    echo "Nginx configuration test failed. Please check the configuration."
    exit 1
fi

# Also fix the Express server CORS configuration
if [ -f "/var/www/dsphoto-backend/server.js" ]; then
    cd /var/www/dsphoto-backend
    
    # Create backup
    cp server.js server.js.bak

    # Fix any duplicate CORS middleware
    if grep -q "corsOptions" server.js; then
        # Update existing configuration
        cat > cors-fix.js << 'EOL'
// CORS configuration
const corsOptions = {
    origin: 'https://fotods.no',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
    ],
    credentials: true,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));
EOL

        # Find and replace CORS setup block
        grep -n "corsOptions\|app.use(cors" server.js
        
        # For debugging only, print the original server.js
        echo "Original CORS config in server.js:"
        grep -A 15 "corsOptions\|app.use(cors" server.js
    fi
fi

# Test CORS headers
echo "Testing CORS headers..."
curl -s -I -X OPTIONS -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: GET" https://api.fotods.no/images | grep -i "access-control"

echo "CORS fix completed!"
EOF

# Make script executable
chmod +x server-cors-fix.sh

# Upload the files
echo -e "${YELLOW}Uploading Nginx configuration and fix script...${NC}"
scp -i $PEM_FILE fixed-nginx.conf server-cors-fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/

# Run the script
echo -e "${YELLOW}Applying CORS fix...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/server-cors-fix.sh && sudo /home/$EC2_USER/server-cors-fix.sh"

# Clean up local files
rm -f fixed-nginx.conf server-cors-fix.sh

echo -e "${GREEN}CORS fix has been applied!${NC}"
echo -e "${YELLOW}Please refresh your browser and check if the API requests work correctly.${NC}" 