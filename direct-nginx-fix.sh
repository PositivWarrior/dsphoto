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

echo "Creating direct Nginx fix script..."
cat > direct_nginx_fix.sh << 'EOF'
#!/bin/bash

# Create a simplified Nginx configuration that's guaranteed to work
cat > /tmp/nginx-simple.conf << 'NGINX_CONFIG'
server {
    listen 80;
    server_name api.fotods.no;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.fotods.no;
    
    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    
    # For preflight OPTIONS requests
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin 'https://fotods.no' always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header Access-Control-Allow-Credentials 'true' always;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Add CORS headers to all responses
        add_header Access-Control-Allow-Origin 'https://fotods.no' always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header Access-Control-Allow-Credentials 'true' always;
    }
}
NGINX_CONFIG

# Backup existing configuration
echo "Backing up existing Nginx config..."
sudo cp /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend.backup.$(date +%Y%m%d%H%M%S)

# Apply new configuration
echo "Applying new Nginx configuration..."
sudo cp /tmp/nginx-simple.conf /etc/nginx/sites-available/dsphoto-backend

# Test and restart Nginx
echo "Testing and restarting Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "Nginx configuration applied successfully!"
else
    echo "Nginx configuration test failed, reverting to backup..."
    sudo cp $(ls -t /etc/nginx/sites-available/dsphoto-backend.backup.* | head -1) /etc/nginx/sites-available/dsphoto-backend
    sudo nginx -t && sudo systemctl restart nginx
fi

# Verify with curl
echo ""
echo "Testing CORS preflight request:"
curl -I -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: GET" -X OPTIONS https://api.fotods.no/images

echo ""
echo "Testing regular GET request:"
curl -I -H "Origin: https://fotods.no" https://api.fotods.no/images

echo ""
echo "Fix completed!"
EOF

echo "Uploading and executing direct Nginx fix script..."
chmod +x direct_nginx_fix.sh
scp -i $PEM_FILE direct_nginx_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/direct_nginx_fix.sh && sudo /home/$EC2_USER/direct_nginx_fix.sh"

# Clean up
rm -f direct_nginx_fix.sh
echo "Direct Nginx fix completed." 