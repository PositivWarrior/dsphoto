#!/bin/bash

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

echo "Creating CORS diagnostic script..."
cat > cors_diagnostic.sh << 'EOF'
#!/bin/bash

echo "===== CHECKING NGINX CONFIGURATION ====="
# Check if the server block exists
if [ ! -f /etc/nginx/sites-available/dsphoto-backend ]; then
    echo "ERROR: dsphoto-backend Nginx configuration file doesn't exist"
else
    echo "Nginx configuration file exists"
    
    # Check CORS headers in the configuration
    if grep -q "Access-Control-Allow-Origin" /etc/nginx/sites-available/dsphoto-backend; then
        echo "CORS headers found in Nginx configuration"
        grep -A 5 "Access-Control-Allow-Origin" /etc/nginx/sites-available/dsphoto-backend
    else
        echo "ERROR: No CORS headers found in Nginx configuration"
    fi
    
    # Check if OPTIONS method is properly handled
    if grep -q "OPTIONS" /etc/nginx/sites-available/dsphoto-backend; then
        echo "OPTIONS method handling found in Nginx configuration"
        grep -A 10 "OPTIONS" /etc/nginx/sites-available/dsphoto-backend
    else
        echo "ERROR: No OPTIONS method handling found in Nginx configuration"
    fi
fi

echo ""
echo "===== CHECKING NODE.JS SERVER CONFIGURATION ====="
# Check if server.js has CORS configuration
cd /var/www/dsphoto-backend
if grep -q "corsOptions" server.js; then
    echo "CORS options found in server.js"
    grep -A 10 "corsOptions" server.js
else
    echo "No CORS options found in server.js"
fi

echo ""
echo "===== TESTING CORS HEADERS ====="
# Test CORS headers with curl
echo "Testing OPTIONS preflight request:"
curl -I -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: GET" -X OPTIONS https://api.fotods.no/images

echo ""
echo "Testing regular GET request:"
curl -I -H "Origin: https://fotods.no" https://api.fotods.no/images

echo ""
echo "===== DIRECT FIX ====="
echo "Applying direct CORS fix to Nginx configuration..."

# Create a new configuration with proper CORS settings
cat > /tmp/nginx-cors-fix << 'EOF2'
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
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Handle OPTIONS method globally for CORS preflight requests
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
        
        # CORS headers for API requests
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '1728000' always;
    }
    
    location /assets/ {
        alias /var/www/dsphoto-backend/assets/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
    }
}
EOF2

# Backup the current configuration and apply the fix
sudo cp /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend.bak.$(date +%Y%m%d%H%M%S)
sudo cp /tmp/nginx-cors-fix /etc/nginx/sites-available/dsphoto-backend

# Also update Express.js CORS configuration
echo "Updating server.js CORS configuration..."
if ! grep -q "corsOptions.*origin" server.js; then
    if grep -q "const corsOptions" server.js; then
        # Update existing corsOptions
        sudo sed -i "/const corsOptions/a\\\\torigin: 'https://fotods.no'," server.js
    else
        # Add new corsOptions before app.use(cors())
        sudo sed -i "/app.use(cors(/i\\const corsOptions = {\\n\\torigin: 'https://fotods.no',\\n\\tmethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],\\n\\tallowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],\\n\\tcredentials: true,\\n\\toptionsSuccessStatus: 204\\n};\\n" server.js
        sudo sed -i "s/app.use(cors(/app.use(cors(corsOptions/" server.js
    fi
    
    # Restart the Node.js application
    pm2 restart dsphoto-backend
fi

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "Testing CORS headers after fix:"
curl -I -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: GET" -X OPTIONS https://api.fotods.no/images
EOF

echo "Uploading and executing diagnostic script..."
chmod +x cors_diagnostic.sh

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "ERROR: PEM file not found. Checking parent directory..."
    PEM_FILE="../$PEM_FILE"
    if [ ! -f "$PEM_FILE" ]; then
        echo "ERROR: PEM file not found in parent directory either. Please provide the correct path."
        exit 1
    fi
fi

# Upload and execute the script
scp -i $PEM_FILE cors_diagnostic.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/cors_diagnostic.sh && sudo /home/$EC2_USER/cors_diagnostic.sh"

# Clean up
rm -f cors_diagnostic.sh
echo "CORS diagnostics and fix completed." 