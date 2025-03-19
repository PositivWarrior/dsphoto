#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing Nginx configuration for CORS and upload limits...${NC}"

# Create command to update Nginx
cat > nginx-update.sh << 'EOL'
#!/bin/bash

# Backup the current configuration
sudo cp /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend.bak

# Create the new configuration
sudo tee /etc/nginx/sites-available/dsphoto-backend > /dev/null << 'CONFIG'
server {
    listen 80;
    server_name api.fotods.no;
    root /var/www/html;
    
    # Increase client body size limit for large uploads
    client_max_body_size 50M;
    
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
        allow all;
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
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for all requests
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header "Access-Control-Allow-Credentials" "true" always;
        add_header "Access-Control-Max-Age" "1728000" always;
        
        # Handle OPTIONS method for preflight requests
        if ($request_method = "OPTIONS") {
            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
            add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
            add_header "Access-Control-Allow-Credentials" "true" always;
            add_header "Access-Control-Max-Age" "1728000" always;
            add_header "Content-Type" "text/plain charset=UTF-8";
            add_header "Content-Length" "0";
            return 204;
        }
    }
    
    location /assets/ {
        alias /var/www/dsphoto-backend/assets/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
    }
}
CONFIG

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx
exit $?
EOL

echo -e "${YELLOW}Copying update script to server...${NC}"
chmod +x nginx-update.sh
scp -i fotods-kp.pem nginx-update.sh ubuntu@51.21.110.161:/tmp/nginx-update.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to copy script to server!${NC}"
    rm nginx-update.sh
    exit 1
fi

echo -e "${YELLOW}Running update script on server...${NC}"
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "chmod +x /tmp/nginx-update.sh && /tmp/nginx-update.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to update Nginx configuration!${NC}"
    rm nginx-update.sh
    exit 1
fi

# Clean up
rm nginx-update.sh

echo -e "${GREEN}Nginx configuration updated successfully!${NC}"
echo -e "${YELLOW}Testing API and CORS...${NC}"

# Test the API to verify it's working
curl -I -H "Origin: https://fotods.no" https://api.fotods.no

if [ $? -ne 0 ]; then
    echo -e "${RED}API test failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}You should now be able to upload images without CORS errors.${NC}" 