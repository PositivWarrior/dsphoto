#!/bin/bash

echo "Starting deployment process to AWS EC2..."

# Create a temporary directory for files to sync
TEMP_DIR="temp_deploy"
mkdir -p $TEMP_DIR
echo "Created temporary directory: $TEMP_DIR"

# Copy all relevant backend files
echo "Copying backend files to temporary directory..."
cp -r controllers config middleware models routes server.js package.json package-lock.json $TEMP_DIR/
echo "Files copied successfully."

# Install Sharp for image optimization
echo "Adding Sharp dependency to package.json..."
sed -i 's/"dependencies": {/"dependencies": {\n    "sharp": "^0.32.6",/' $TEMP_DIR/package.json
echo "Sharp dependency added."

# Copy environment file
if [ -f .env.production ]; then
    echo "Copying .env.production to .env..."
    cp .env.production $TEMP_DIR/.env
    echo "Environment file copied."
else
    echo "Warning: .env.production not found."
fi

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
REMOTE_DIR="/var/www/dsphoto-backend"
PEM_FILE="../fotods-kp.pem"

echo "Checking for PEM file at $PEM_FILE..."
if [ ! -f "$PEM_FILE" ]; then
    echo "Error: PEM file not found at $PEM_FILE"
    exit 1
else
    echo "PEM file found."
fi

# Copy files to EC2
echo "Copying files to EC2 server at $EC2_HOST..."
scp -i $PEM_FILE -r $TEMP_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/dsphoto-backend/
echo "Files copied to EC2."

# Clean up temporary directory
echo "Cleaning up temporary directory..."
rm -rf $TEMP_DIR
echo "Temporary directory removed."

# SSH into the instance and set up the application
echo "Connecting to EC2 to set up the application..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    echo 'Creating application directory...'
    sudo mkdir -p $REMOTE_DIR
    sudo chown -R $EC2_USER:$EC2_USER $REMOTE_DIR
    
    echo 'Copying files to application directory...'
    cp -r /home/$EC2_USER/dsphoto-backend/* $REMOTE_DIR/
    
    echo 'Changing to application directory...'
    cd $REMOTE_DIR
    
    echo 'Installing dependencies...'
    npm install
    
    echo 'Restarting application with PM2...'
    pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend
    pm2 save
    
    echo 'Application setup complete.'
"

echo "Deployment to AWS EC2 completed successfully!" 