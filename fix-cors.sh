#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"  # Updated path - assuming it's in the current directory

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    echo -e "${YELLOW}Please enter the correct path to your PEM file:${NC}"
    read -p "> " PEM_FILE
    
    if [ ! -f "$PEM_FILE" ]; then
        echo -e "${RED}Error: PEM file still not found. Exiting.${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}Creating CORS fix script...${NC}"

# Create a temporary script that will be executed on the server
cat > temp_cors_fix.sh << 'EOF'
#!/bin/bash

# Backup the existing configuration
echo "Creating backup of current Nginx configuration..."
sudo cp /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend.bak.$(date +%Y%m%d%H%M%S)

# Create a new configuration with proper CORS settings
echo "Creating updated Nginx configuration with proper CORS headers..."
sudo tee /etc/nginx/sites-available/dsphoto-backend > /dev/null << 'NGINXCONF'
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
    
    # CORS headers for all locations
    add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Max-Age' '1728000' always;
    
    # Special handling for OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
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
    }
    
    location /assets/ {
        alias /var/www/dsphoto-backend/assets/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
    }
}
NGINXCONF

# Test and reload Nginx
echo "Testing the new configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Configuration test successful. Reloading Nginx..."
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully!"
else
    echo "Configuration test failed. Reverting to previous configuration..."
    sudo cp $(ls -t /etc/nginx/sites-available/dsphoto-backend.bak.* | head -1) /etc/nginx/sites-available/dsphoto-backend
    sudo nginx -t && sudo systemctl reload nginx
    exit 1
fi

# Also ensure Express CORS is configured correctly
echo "Checking Express CORS configuration..."
cd /var/www/dsphoto-backend

# Update corsOptions in server.js if it exists and is different
if grep -q "const corsOptions" server.js; then
    echo "Found CORS options in server.js, checking if they need to be updated..."
    if ! grep -q "origin: 'https://fotods.no'" server.js; then
        echo "Updating CORS options in server.js..."
        sed -i "s/const corsOptions = {/const corsOptions = {\n\torigin: 'https:\/\/fotods.no',/" server.js
        echo "Restarting Node.js application..."
        pm2 restart dsphoto-backend
    else
        echo "CORS configuration in server.js is already correct."
    fi
fi

# Final verification
echo "Verifying CORS headers with curl..."
curl -I -H "Origin: https://fotods.no" -X OPTIONS https://api.fotods.no/
echo ""
echo "CORS fix completed successfully!"
EOF

# Upload the fix script to the server
echo -e "${YELLOW}Uploading fix script to EC2...${NC}"
scp -i $PEM_FILE temp_cors_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/cors_fix.sh

# Execute the fix script on the server
echo -e "${YELLOW}Executing fix script on EC2...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/cors_fix.sh && /home/$EC2_USER/cors_fix.sh"

# Clean up
echo -e "${YELLOW}Cleaning up temporary files...${NC}"
rm -f temp_cors_fix.sh

echo -e "${GREEN}CORS fix completed. Your API should now allow requests from fotods.no${NC}" 