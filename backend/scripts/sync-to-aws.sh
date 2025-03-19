#!/bin/bash

# Directory containing your backend files
LOCAL_DIR="./backend/"

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
REMOTE_DIR="/var/www/dsphoto-backend"
PEM_FILE="./fotods-kp.pem"

# Create a temporary directory for files to sync
TEMP_DIR="temp_deploy"
mkdir -p $TEMP_DIR

# Copy all relevant backend files
cp -r controllers config middleware models routes server.js package.json package-lock.json $TEMP_DIR/

# Make sure the image optimizer is included
if [ -f "controllers/imageOptimizer.js" ]; then
    echo "Image optimizer found, including in deployment"
else
    echo "WARNING: Image optimizer controller not found. Deployment may not include image optimization."
fi

# Ensure Sharp is installed for image optimization
echo "\"sharp\": \"^0.32.6\"," >> $TEMP_DIR/package.json.tmp
sed 's/"dependencies": {/"dependencies": {\n    /' $TEMP_DIR/package.json > $TEMP_DIR/package.json.tmp
mv $TEMP_DIR/package.json.tmp $TEMP_DIR/package.json

# Remove unnecessary files
rm -rf $TEMP_DIR/node_modules
rm -f $TEMP_DIR/.env $TEMP_DIR/.env.local

# Copy files to EC2 
echo "Copying files to EC2..."
cd ..
scp -i $PEM_FILE -r backend/$TEMP_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/dsphoto-backend/

# Clean up temporary directory
rm -rf backend/$TEMP_DIR

# SSH into the instance and set up the application
echo "Setting up application on EC2..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    sudo mkdir -p /var/www/dsphoto-backend
    sudo chown -R ubuntu:ubuntu /var/www/dsphoto-backend
    cp -r /home/ubuntu/dsphoto-backend/* /var/www/dsphoto-backend/
    cd /var/www/dsphoto-backend
    
    # Make sure imageOptimizer routes are properly configured
    if grep -q 'imageOptimizer' routes/imageRoutes.js; then
        echo 'Image optimizer routes found'
    else
        echo 'WARNING: Image optimizer routes not found in imageRoutes.js'
    fi
    
    # Install or update Sharp
    echo 'Installing dependencies including Sharp for image optimization...'
    npm install sharp@0.32.6
    npm install
    
    # Restart the application
    sudo npm install -g pm2
    cp .env.production .env
    pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend
    pm2 save
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
    
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