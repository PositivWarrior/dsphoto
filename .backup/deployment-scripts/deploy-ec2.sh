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
PEM_FILE="../fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Copy files to EC2 
echo -e "${YELLOW}Copying files to EC2...${NC}"
scp -i $PEM_FILE -r $TEMP_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/dsphoto-backend/
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to copy files to EC2${NC}"
    exit 1
fi

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
    
    # Setup Nginx for HTTP/2 if not already configured
    if ! grep -q 'http2' /etc/nginx/sites-available/dsphoto-backend; then
        echo 'Updating Nginx to use HTTP/2...'
        sudo sed -i 's/listen 443 ssl;/listen 443 ssl http2;/g' /etc/nginx/sites-available/dsphoto-backend
        sudo nginx -t && sudo systemctl restart nginx
    else
        echo 'Nginx already configured for HTTP/2'
    fi
    
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