#!/bin/bash

# Set up variables
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "Error: PEM file not found at $PEM_FILE"
    exit 1
fi

# Create the script to run on the server
cat > fix-nginx.sh << 'EOF'
#!/bin/bash

echo "Configuring Nginx for proper HTTPS handling..."

# Create proper Nginx configuration for HTTPS
sudo tee /etc/nginx/sites-available/simple-api > /dev/null << 'EOC'
server {
    listen 80;
    server_name api.fotods.no;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.fotods.no;

    # SSL settings
    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    
    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Other security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS" always;
        add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;

        # Handle preflight requests
        if ($request_method = "OPTIONS") {
            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS" always;
            add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
            add_header "Content-Length" "0";
            return 204;
        }
    }
}
EOC

# Remove old/conflicting configuration
sudo rm -f /etc/nginx/sites-enabled/api-redirect.conf
sudo ln -sf /etc/nginx/sites-available/simple-api /etc/nginx/sites-enabled/

# Check Nginx configuration
echo "Checking Nginx configuration..."
sudo nginx -t

# If the configuration is valid, reload Nginx
if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    sudo systemctl restart nginx
else
    echo "Error in Nginx configuration. Please check and fix manually."
    exit 1
fi

echo "Nginx configuration updated successfully!"
EOF

# Upload the script to the server
echo "Uploading fix script to server..."
scp -i "$PEM_FILE" fix-nginx.sh "$EC2_USER@$EC2_HOST:/home/$EC2_USER/"

# Execute the script on the server
echo "Executing fix script on server..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "chmod +x /home/$EC2_USER/fix-nginx.sh && sudo /home/$EC2_USER/fix-nginx.sh"

# Clean up the local script
rm -f fix-nginx.sh

echo "Nginx update process completed!" 