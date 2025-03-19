#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating server-fix script...${NC}"

# Create a server-side fix script
cat > server-fix.sh << 'EOF'
#!/bin/bash

echo "Starting server configuration fix..."

# Step 1: Create global client_max_body_size config
echo "Setting up global upload size limit..."
echo "client_max_body_size 50M;" | sudo tee /etc/nginx/conf.d/client_max_body_size.conf

# Step 2: Backup old config
echo "Backing up existing configuration..."
sudo cp /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend.bak.$(date +%Y%m%d%H%M%S)

# Step 3: Create new site config
echo "Creating new Nginx configuration..."
sudo tee /etc/nginx/sites-available/dsphoto-backend > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name api.fotods.no;
    root /var/www/html;
    
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
        
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header "Access-Control-Allow-Credentials" "true" always;
        add_header "Access-Control-Max-Age" "1728000" always;
        
        if ($request_method = 'OPTIONS') {
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
NGINXCONF

# Step 4: Verify and restart Nginx
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "Nginx configuration failed! Reverting to backup..."
    sudo cp /etc/nginx/sites-available/dsphoto-backend.bak.$(ls -t /etc/nginx/sites-available/dsphoto-backend.bak.* | head -1 | cut -d/ -f5) /etc/nginx/sites-available/dsphoto-backend
    exit 1
fi

echo "Restarting Nginx..."
sudo systemctl restart nginx

# Step 5: Verify the server is responding with correct CORS headers
echo "Verifying CORS headers..."
curl -I -H "Origin: https://fotods.no" https://api.fotods.no | grep -i "Access-Control-Allow-Origin"

if [ $? -ne 0 ]; then
    echo "CORS verification failed!"
    exit 1
fi

echo "Server configuration completed successfully!"
EOF

echo -e "${YELLOW}Uploading fix script to server...${NC}"
chmod +x server-fix.sh
scp -i fotods-kp.pem server-fix.sh ubuntu@51.21.110.161:/tmp/server-fix.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to upload script to server!${NC}"
    rm server-fix.sh
    exit 1
fi

echo -e "${YELLOW}Running fix script on server...${NC}"
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "chmod +x /tmp/server-fix.sh && sudo bash /tmp/server-fix.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}Server fix script failed!${NC}"
    rm server-fix.sh
    exit 1
fi

# Clean up
rm server-fix.sh

echo -e "${GREEN}Server configuration has been fixed!${NC}"
echo -e "${YELLOW}Testing API endpoint...${NC}"

# Test CORS headers and perform a OPTIONS preflight request
echo -e "${YELLOW}Testing CORS with OPTIONS request...${NC}"
curl -v -X OPTIONS \
  -H "Origin: https://fotods.no" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  https://api.fotods.no/images

echo ""
echo -e "${GREEN}All done! You should now be able to upload larger images without CORS errors.${NC}"
echo -e "${YELLOW}Please try uploading images on the admin page again.${NC}" 