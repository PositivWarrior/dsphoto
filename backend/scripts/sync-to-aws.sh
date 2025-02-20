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
cp -r $LOCAL_DIR/* $TEMP_DIR/
rm -rf $TEMP_DIR/node_modules
rm -f $TEMP_DIR/.env $TEMP_DIR/.env.local

# Copy files to EC2
scp -i $PEM_FILE -r $TEMP_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/dsphoto-backend/

# Clean up temporary directory
rm -rf $TEMP_DIR

# SSH into the instance and set up the application
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    sudo mkdir -p /var/www/dsphoto-backend
    sudo chown -R ubuntu:ubuntu /var/www/dsphoto-backend
    cp -r /home/ubuntu/dsphoto-backend/* /var/www/dsphoto-backend/
    cd /var/www/dsphoto-backend
    sudo apt update
    sudo apt install -y nodejs npm
    npm install
    sudo npm install -g pm2
    cp .env.production .env
    pm2 start server.js --name dsphoto-backend
    pm2 save
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
" 