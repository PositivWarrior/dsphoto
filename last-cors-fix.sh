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

echo "Creating final CORS fix script..."
cat > final_cors_fix.sh << 'EOF'
#!/bin/bash

# Create a simplified Nginx configuration that's guaranteed to work
cat > /tmp/nginx-final.conf << 'NGINX_CONFIG'
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
    
    location / {
        # Handle OPTIONS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Content-Type' 'text/plain' always;
            add_header 'Content-Length' '0' always;
            return 204;
        }
        
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Add CORS headers to all responses
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
}
NGINX_CONFIG

# Backup existing configuration
echo "Backing up existing Nginx config..."
sudo cp /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend.backup.$(date +%Y%m%d%H%M%S)

# Apply new configuration
echo "Applying new Nginx configuration..."
sudo cp /tmp/nginx-final.conf /etc/nginx/sites-available/dsphoto-backend

# Test and restart Nginx
echo "Testing and restarting Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "Nginx configuration applied successfully!"
else
    echo "Nginx configuration test failed, reverting to backup..."
    sudo cp $(ls -t /etc/nginx/sites-available/dsphoto-backend.backup.* | head -1) /etc/nginx/sites-available/dsphoto-backend
    sudo systemctl restart nginx
fi

# Also enable CORS in Express.js directly
echo "Adding Express.js CORS middleware..."
cd /var/www/dsphoto-backend
cat > cors.js << 'CORS_JS'
// CORS Middleware
export default function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://fotods.no');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
}
CORS_JS

# Add to server.js if not already there
if ! grep -q "cors.js" server.js; then
    echo "Adding CORS middleware to server.js..."
    # Add import after other imports but before route imports
    sed -i '/^import/ a import corsMiddleware from "./cors.js";' server.js
    # Add middleware use before route usage
    sed -i '/app.use(express.json())/ a app.use(corsMiddleware);' server.js
fi

# Restart the Node.js application
echo "Restarting Node.js application..."
pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend

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

echo "Uploading and executing final CORS fix script..."
chmod +x final_cors_fix.sh
scp -i $PEM_FILE final_cors_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/final_cors_fix.sh && sudo /home/$EC2_USER/final_cors_fix.sh"

# Clean up
rm -f final_cors_fix.sh
echo "Final CORS fix completed."
EOF 