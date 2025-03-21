#!/bin/bash

# Create a temporary directory for files to sync
TEMP_DIR="temp_deploy"
mkdir -p $TEMP_DIR

# Copy all relevant backend files from parent directory
echo "Copying backend files to temporary directory..."
cp -r ../controllers ../config ../middleware ../models ../routes ../server.js ../package.json ../package-lock.json $TEMP_DIR/

# Make sure the image optimizer is included
if [ -f "../controllers/imageOptimizer.js" ]; then
    echo "Image optimizer found, including in deployment"
else
    echo "WARNING: Image optimizer controller not found. Deployment may not include image optimization."
fi

# Ensure Sharp is installed for image optimization
echo "Adding Sharp dependency to package.json..."
sed -i 's/"dependencies": {/"dependencies": {\n    "sharp": "^0.32.6",/' $TEMP_DIR/package.json

# Remove unnecessary files
echo "Cleaning up unnecessary files..."
rm -rf $TEMP_DIR/node_modules
rm -f $TEMP_DIR/.env $TEMP_DIR/.env.local

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
REMOTE_DIR="/var/www/dsphoto-backend"
PEM_FILE="../../fotods-kp.pem"

# Copy files to EC2 
echo "Copying files to EC2..."
scp -i $PEM_FILE -r $TEMP_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/dsphoto-backend/

# Clean up temporary directory
echo "Cleaning up temporary directory..."
rm -rf $TEMP_DIR

# SSH into the instance and set up the application
echo "Setting up application on EC2..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    sudo mkdir -p $REMOTE_DIR
    sudo chown -R $EC2_USER:$EC2_USER $REMOTE_DIR
    cp -r /home/$EC2_USER/dsphoto-backend/* $REMOTE_DIR/
    cd $REMOTE_DIR
    
    # Make sure imageOptimizer routes are properly configured
    if grep -q 'imageOptimizer' routes/imageRoutes.js; then
        echo 'Image optimizer routes found'
    else
        echo 'WARNING: Image optimizer routes not found in imageRoutes.js'
    fi
    
    # Copy environment file if exists
    if [ -f /home/$EC2_USER/dsphoto-backend/.env.production ]; then
        cp /home/$EC2_USER/dsphoto-backend/.env.production $REMOTE_DIR/.env
        echo 'Copied .env.production to .env'
    fi
    
    # Install dependencies
    echo 'Installing dependencies including Sharp for image optimization...'
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
"

echo "Deployment to AWS EC2 completed successfully!" 