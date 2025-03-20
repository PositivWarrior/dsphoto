#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
REMOTE_DIR="/var/www/dsphoto-backend"
PEM_FILE="fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Create a temporary directory for files to sync
echo -e "${YELLOW}Preparing files for deployment...${NC}"
TEMP_DIR="temp_deploy"
mkdir -p $TEMP_DIR

# Check if we're in the backend directory
if [ -f "server.js" ]; then
    # We're already in the backend directory
    SOURCE_DIR="."
elif [ -d "backend" ]; then
    # We're in the root directory with a backend folder
    SOURCE_DIR="backend"
else
    echo -e "${RED}Error: Could not find backend directory or server.js${NC}"
    echo -e "${YELLOW}Please navigate to the backend directory and try again${NC}"
    exit 1
fi

# Copy all relevant backend files
echo -e "${YELLOW}Copying backend files to temporary directory...${NC}"
cp -r $SOURCE_DIR/controllers $SOURCE_DIR/config $SOURCE_DIR/middleware $SOURCE_DIR/models $SOURCE_DIR/routes $SOURCE_DIR/server.js $SOURCE_DIR/package.json $SOURCE_DIR/package-lock.json $TEMP_DIR/ 2>/dev/null || {
    echo -e "${RED}Error copying files to temporary directory${NC}"
    echo -e "${YELLOW}Make sure you are in the correct directory${NC}"
    exit 1
}

# Copy assets directory if it exists
if [ -d "$SOURCE_DIR/assets" ]; then
    cp -r $SOURCE_DIR/assets $TEMP_DIR/
    echo -e "${GREEN}Copied assets directory to deployment package${NC}"
fi

# Copy environment file
if [ -f "$SOURCE_DIR/.env.production" ]; then
    cp $SOURCE_DIR/.env.production $TEMP_DIR/.env
    echo -e "${GREEN}Copied .env.production to deployment directory${NC}"
else
    echo -e "${YELLOW}Warning: .env.production not found${NC}"
fi

# Update the port in server.js from 8000 to 3000 for consistency with our HTTPS setup
echo -e "${YELLOW}Updating server port to 3000...${NC}"
sed -i 's/PORT = process.env.PORT || 8000/PORT = process.env.PORT || 3000/g' $TEMP_DIR/server.js
sed -i 's/server.listen(PORT, .*)/server.listen(PORT, () => {/g' $TEMP_DIR/server.js

# Also update the server port in .env if it exists
if [ -f "$TEMP_DIR/.env" ]; then
    sed -i 's/PORT=8000/PORT=3000/g' $TEMP_DIR/.env
fi

# Remove binding to localhost only (listen on all interfaces)
sed -i "s/server.listen(PORT, '127.0.0.1'/server.listen(PORT/g" $TEMP_DIR/server.js

# Ensure CORS is properly set up
echo -e "${YELLOW}Setting up CORS for HTTPS...${NC}"
cat > $TEMP_DIR/cors-middleware.js << 'EOF'
// CORS middleware to allow requests from fotods.no
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
EOF

# Add CORS middleware to server.js
sed -i '/import compression from/a import corsMiddleware from "./cors-middleware.js";' $TEMP_DIR/server.js
sed -i '/app.use(compression/a app.use(corsMiddleware);' $TEMP_DIR/server.js

# Remove unnecessary files
echo -e "${YELLOW}Cleaning up unnecessary files...${NC}"
rm -rf $TEMP_DIR/node_modules
rm -f $TEMP_DIR/.env.local $TEMP_DIR/.env.development

# Create Nginx configuration
echo -e "${YELLOW}Creating Nginx configuration...${NC}"
cat > nginx-config.conf << 'EOF'
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
    listen 443 ssl http2;
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
        proxy_pass http://127.0.0.1:3000;
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
EOF

# Copy files to EC2 
echo -e "${YELLOW}Copying files to EC2...${NC}"
scp -i $PEM_FILE -r $TEMP_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/dsphoto-backend/
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to copy files to EC2${NC}"
    exit 1
fi

# Copy Nginx configuration
scp -i $PEM_FILE nginx-config.conf $EC2_USER@$EC2_HOST:/home/$EC2_USER/nginx-config.conf
rm -f nginx-config.conf

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
    
    # Install dependencies
    echo 'Installing dependencies...'
    npm install
    
    # Install PM2 if not already installed
    if ! command -v pm2 &> /dev/null; then
        echo 'Installing PM2...'
        sudo npm install -g pm2
    fi
    
    # Apply Nginx configuration
    echo 'Applying Nginx configuration...'
    sudo mv /home/$EC2_USER/nginx-config.conf /etc/nginx/sites-available/dsphoto-backend
    sudo ln -sf /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    
    # Ensure Certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo 'Installing Certbot...'
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Check if SSL certificate already exists
    if [ ! -d '/etc/letsencrypt/live/api.fotods.no' ]; then
        echo 'Obtaining SSL certificate...'
        sudo certbot --nginx -d api.fotods.no --non-interactive --agree-tos --email webmaster@fotods.no
    fi
    
    # Restart the application
    echo 'Restarting application with PM2...'
    pm2 delete dsphoto-backend || true
    pm2 start server.js --name dsphoto-backend
    pm2 save
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u $EC2_USER --hp /home/$EC2_USER
    
    # Show running processes
    echo 'Checking running processes:'
    pm2 list
    
    # Create assets directory if it doesn't exist
    if [ ! -d '$REMOTE_DIR/assets' ]; then
        mkdir -p $REMOTE_DIR/assets
    fi
    
    # Set correct permissions
    sudo chown -R $EC2_USER:$EC2_USER $REMOTE_DIR
    
    # Test API
    echo 'Testing API endpoints:'
    curl -s http://localhost:3000 | grep -q 'DS PHOTO API is running' && echo 'API is running correctly' || echo 'API is NOT running correctly'
    
    # Verify Nginx configuration
    echo 'Verifying Nginx configuration:'
    sudo nginx -t
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment to AWS EC2 completed successfully!${NC}"
    echo -e "${GREEN}Your backend is now accessible at https://api.fotods.no${NC}"
    echo -e "${YELLOW}Run these commands to test:${NC}"
    echo -e "  curl -v https://api.fotods.no"
    echo -e "  curl -v -H 'Origin: https://fotods.no' https://api.fotods.no/images"
else
    echo -e "${RED}There were errors during deployment. Please check the output.${NC}"
    exit 1
fi 