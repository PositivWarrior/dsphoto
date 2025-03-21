#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing Nginx configuration...${NC}"

# SSH command to fix the Nginx configuration
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "
    # Create temporary Nginx configuration file
    cat > /tmp/dsphoto-backend << 'EOF'
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
    listen 443 ssl;
    http2 on;
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

    add_header Strict-Transport-Security 'max-age=63072000' always;
    add_header Access-Control-Allow-Origin 'https://fotods.no' always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header Access-Control-Allow-Credentials 'true' always;
    add_header Access-Control-Max-Age '1728000' always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Special handling for OPTIONS requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin 'https://fotods.no' always;
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE' always;
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header Access-Control-Allow-Credentials 'true' always;
            add_header Access-Control-Max-Age '1728000' always;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length '0';
            return 204;
        }
    }

    location /assets/ {
        alias /var/www/dsphoto-backend/assets/;
        try_files \$uri \$uri/ =404;
        expires 30d;
        add_header Cache-Control 'public, no-transform';
        add_header Access-Control-Allow-Origin 'https://fotods.no' always;
        add_header Access-Control-Allow-Credentials 'true' always;
    }
}
EOF

    # Move the new configuration in place
    sudo cp /tmp/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend

    # Test Nginx configuration
    echo 'Testing Nginx configuration...'
    sudo nginx -t

    if [ \$? -eq 0 ]; then
        # Reload Nginx
        echo 'Reloading Nginx...'
        sudo systemctl reload nginx
        echo 'Nginx reloaded successfully!'
    else
        echo 'Nginx configuration test failed!'
        exit 1
    fi

    # Testing the API endpoint
    echo 'Testing API endpoint...'
    curl -s -I https://api.fotods.no/images
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Nginx configuration fixed successfully!${NC}"
else
    echo -e "${RED}Error fixing Nginx configuration. Please check the server logs.${NC}"
    exit 1
fi 