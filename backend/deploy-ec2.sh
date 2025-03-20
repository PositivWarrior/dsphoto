#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create a temporary directory for files to sync
TEMP_DIR="temp_deploy"
mkdir -p $TEMP_DIR

echo -e "${YELLOW}Preparing files for deployment...${NC}"

# Copy all relevant backend files
cp -r controllers config middleware models routes server.js package.json package-lock.json $TEMP_DIR/
if [ $? -ne 0 ]; then
    echo -e "${RED}Error copying files to temporary directory${NC}"
    exit 1
fi

# Copy assets directory if it exists
if [ -d "assets" ]; then
    cp -r assets $TEMP_DIR/
    echo -e "${GREEN}Copied assets directory to deployment package${NC}"
fi

# Copy environment file
if [ -f .env.production ]; then
    cp .env.production $TEMP_DIR/.env
    echo -e "${GREEN}Copied .env.production to deployment directory${NC}"
else
    echo -e "${YELLOW}Warning: .env.production not found${NC}"
fi

# Make sure the image optimizer is included
if [ -f "controllers/imageOptimizer.js" ]; then
    echo -e "${GREEN}Image optimizer found, including in deployment${NC}"
else
    echo -e "${YELLOW}Warning: Image optimizer controller not found${NC}"
fi

# Ensure Sharp is installed for image optimization
echo -e "${YELLOW}Updating package.json with Sharp dependency...${NC}"
sed -i 's/"dependencies": {/"dependencies": {\n    "sharp": "^0.32.6",/' $TEMP_DIR/package.json
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: Could not update package.json. Manual installation of Sharp may be needed.${NC}"
fi

# Remove unnecessary files
echo -e "${YELLOW}Cleaning up unnecessary files...${NC}"
rm -rf $TEMP_DIR/node_modules
rm -f $TEMP_DIR/.env.local $TEMP_DIR/.env.development

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
REMOTE_DIR="/var/www/dsphoto-backend"
PEM_FILE="../fotods-kp.pem"  # PEM file in parent directory

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    echo -e "${YELLOW}Please enter the correct path to your PEM file:${NC}"
    read -p "> " PEM_FILE
    
    if [ ! -f "$PEM_FILE" ]; then
        echo -e "${RED}Error: PEM file still not found. Exiting.${NC}"
        exit 1
    fi
fi

# Copy files to EC2 
echo -e "${YELLOW}Copying files to EC2...${NC}"
scp -i $PEM_FILE -r $TEMP_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/dsphoto-backend/
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to copy files to EC2${NC}"
    exit 1
fi

# Create a temporary CORS fix script
echo -e "${YELLOW}Creating CORS fix script...${NC}"
cat > cors_fix.sh << 'EOF'
#!/bin/bash

# Update Nginx configuration with CORS headers
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
        
        # Special handling for OPTIONS requests
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

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx
EOF

# Copy the CORS fix script to EC2
scp -i $PEM_FILE cors_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/cors_fix.sh
rm -f cors_fix.sh

# Clean up temporary directory
echo -e "${YELLOW}Cleaning up temporary directory...${NC}"
rm -rf $TEMP_DIR

# SSH into the instance and set up the application
echo -e "${YELLOW}Setting up application on EC2...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    echo 'Creating application directory...'
    sudo mkdir -p $REMOTE_DIR
    sudo chown -R $EC2_USER:$EC2_USER $REMOTE_DIR
    
    echo 'Copying files to application directory...'
    cp -r /home/$EC2_USER/dsphoto-backend/* $REMOTE_DIR/
    
    cd $REMOTE_DIR
    
    # Verify imageOptimizer routes
    if grep -q 'imageOptimizer' routes/imageRoutes.js; then
        echo 'Image optimizer routes found'
    else
        echo 'WARNING: Image optimizer routes not found in imageRoutes.js'
    fi
    
    # Install dependencies
    echo 'Installing dependencies...'
    npm install
    
    # Install PM2 if not already installed
    if ! command -v pm2 &> /dev/null; then
        echo 'Installing PM2...'
        sudo npm install -g pm2
    fi
    
    # Restart the application
    echo 'Restarting application with PM2...'
    pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend
    pm2 save
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u $EC2_USER --hp /home/$EC2_USER
    
    # Apply CORS fix
    echo 'Applying CORS fix...'
    chmod +x /home/$EC2_USER/cors_fix.sh
    /home/$EC2_USER/cors_fix.sh
    rm -f /home/$EC2_USER/cors_fix.sh
    
    # Show running processes
    echo 'Checking running processes:'
    pm2 list
    
    # Verify Nginx configuration
    echo 'Verifying Nginx configuration:'
    sudo nginx -t
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment to AWS EC2 completed successfully!${NC}"
else
    echo -e "${RED}There were errors during deployment. Please check the output.${NC}"
    exit 1
fi 