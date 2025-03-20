#!/bin/bash

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

echo "Creating CORS fix script..."
cat > cors_fix.sh << 'EOF'
#!/bin/bash

# Create a new configuration with proper CORS settings
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
    
    location / {
        # Special handling for OPTIONS method
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
NGINXCONF

# Update the Express server manually
cd /var/www/dsphoto-backend

# Check if server.js already has CORS config
if grep -q "corsOptions" server.js; then
    echo "CORS options already exists in server.js"
    # Update the origin if needed
    if ! grep -q "origin.*fotods.no" server.js; then
        echo "Updating CORS origin..."
        sudo sed -i "/corsOptions/,/}/ s/{/{\\n\\torigin: 'https:\/\/fotods.no',/" server.js
    fi
else
    echo "Adding CORS configuration to server.js..."
    # Create a temporary file with the CORS config
    cat > /tmp/cors_config.txt << 'CORSCONFIG'
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
	optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));
CORSCONFIG

    # Replace simple cors() with our configuration
    if grep -q "app.use(cors());" server.js; then
        sudo sed -i "s/app.use(cors());/$(cat /tmp/cors_config.txt | sed -e 's/[\&/]/\\&/g' -e 's/$/\\n/' | tr -d '\n')/" server.js
    else
        echo "WARNING: Could not find app.use(cors()) in server.js"
        echo "Manually inserting CORS configuration after import cors"
        sudo sed -i "/import cors/a\\$(cat /tmp/cors_config.txt | sed -e 's/[\&/]/\\&/g' -e 's/$/\\n/' | tr -d '\n')" server.js
    fi
    
    # Clean up
    rm -f /tmp/cors_config.txt
fi

# Restart the application
echo "Restarting Node.js application..."
pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend

# Test and restart Nginx
echo "Testing and restarting Nginx..."
sudo nginx -t && sudo systemctl restart nginx

# Verify the headers
echo ""
echo "Testing CORS headers after fix:"
curl -I -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: GET" -X OPTIONS https://api.fotods.no/images

# Verify that the backend is running
echo ""
echo "Checking if backend application is running:"
pm2 list

echo ""
echo "Fix completed!"
EOF

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
echo "Uploading and executing CORS fix script..."
chmod +x cors_fix.sh
scp -i $PEM_FILE cors_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/cors_fix.sh && sudo /home/$EC2_USER/cors_fix.sh"

# Clean up
rm -f cors_fix.sh
echo "CORS fix completed." 