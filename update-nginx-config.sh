#!/bin/bash

KEY_PATH="/c/MyProjects/dsphoto/fotods-kp.pem"

# Create configuration files
cat > nginx.conf << 'EOF'
load_module /usr/lib/nginx/modules/ngx_http_brotli_filter_module.so;
load_module /usr/lib/nginx/modules/ngx_http_brotli_static_module.so;

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 768;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    server_tokens off;

    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Brotli Settings
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Cache settings
    proxy_cache_path /tmp/nginx_cache levels=1:2 keys_zone=STATIC:10m inactive=24h max_size=1g;

    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

cat > sites-enabled-default << 'EOF'
# API Server Configuration
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
    listen [::]:443 ssl;
    http2 on;
    server_name api.fotods.no;

    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/api.fotods.no/chain.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Caching
        proxy_cache STATIC;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        proxy_cache_valid 200 60m;
        proxy_cache_valid 404 1m;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
EOF

# Copy configuration files to server
scp -i "$KEY_PATH" nginx.conf ubuntu@51.21.110.161:/tmp/
scp -i "$KEY_PATH" sites-enabled-default ubuntu@51.21.110.161:/tmp/

# SSH into the server and execute commands
ssh -i "$KEY_PATH" ubuntu@51.21.110.161 << 'ENDSSH'
# Add Brotli repository
sudo add-apt-repository -y ppa:ondrej/nginx-mainline
sudo apt-get update

# Fix package issues
sudo apt-get install -f

# Remove existing Nginx
sudo apt-get remove -y nginx nginx-common libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static
sudo apt-get autoremove -y

# Install required packages
sudo apt-get install -y nginx libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static certbot python3-certbot-nginx

# Create cache directories
sudo mkdir -p /tmp/nginx_cache
sudo chown www-data:www-data /tmp/nginx_cache

# Generate DH parameters if they don't exist
if [ ! -f /etc/nginx/dhparam.pem ]; then
    sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048
fi

# Force renew SSL certificate
sudo certbot --nginx -d api.fotods.no --non-interactive --agree-tos --email daniel.skarpnes@gmail.com --force-renewal

# Copy configurations
sudo cp /tmp/nginx.conf /etc/nginx/nginx.conf
sudo cp /tmp/sites-enabled-default /etc/nginx/sites-enabled/default

# Reload systemd and restart Nginx
sudo systemctl daemon-reload
sudo nginx -t && sudo systemctl restart nginx

# Clean up temporary files
rm -f /tmp/nginx.conf /tmp/sites-enabled-default
ENDSSH

# Clean up local files
rm -f nginx.conf sites-enabled-default 