#!/bin/bash

# Create Nginx configuration
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name api.fotods.no;
    root /var/www/html;
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
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;

        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header "Access-Control-Allow-Credentials" "true" always;
        add_header "Access-Control-Max-Age" "1728000" always;

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
        client_max_body_size 50M;
    }
}
EOF

# Copy configuration to server
scp -i "C:/MyProjects/dsphoto/fotods-kp.pem" nginx.conf ubuntu@51.21.110.161:/tmp/nginx.conf

# Apply configuration and restart Nginx
ssh -i "C:/MyProjects/dsphoto/fotods-kp.pem" ubuntu@51.21.110.161 "sudo cp /tmp/nginx.conf /etc/nginx/sites-available/default && sudo nginx -t && sudo systemctl restart nginx && rm /tmp/nginx.conf"

# Clean up local file
rm nginx.conf 