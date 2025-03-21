#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"
REMOTE_PATH="/var/www/dsphoto-frontend/"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Check if the archive exists
if [ ! -f "frontend-build.tar.gz" ]; then
    echo -e "${RED}Error: Build archive not found at frontend-build.tar.gz${NC}"
    echo -e "${YELLOW}Please run the build script first: ./frontend/build-frontend.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying frontend to EC2 instance...${NC}"

# Upload archive to EC2
echo -e "${YELLOW}Uploading build archive to EC2...${NC}"
scp -i $PEM_FILE frontend-build.tar.gz $EC2_USER@$EC2_HOST:/home/$EC2_USER/frontend-build.tar.gz

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to upload build archive to EC2${NC}"
    exit 1
fi

# Execute deployment commands on the EC2 instance
echo -e "${YELLOW}Extracting and deploying on EC2...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    # Backup existing deployment
    if [ -d $REMOTE_PATH ]; then
        echo 'Creating backup of existing deployment...'
        sudo mv $REMOTE_PATH ${REMOTE_PATH}_backup_\$(date +%Y%m%d_%H%M%S)
    fi

    # Create deployment directory if it doesn't exist
    sudo mkdir -p $REMOTE_PATH

    # Extract build to deployment directory
    echo 'Extracting build files...'
    sudo tar -xzf /home/$EC2_USER/frontend-build.tar.gz -C $REMOTE_PATH --strip-components=1

    # Set correct permissions
    echo 'Setting permissions...'
    sudo chown -R www-data:www-data $REMOTE_PATH
    sudo chmod -R 755 $REMOTE_PATH

    # Clean up
    echo 'Cleaning up...'
    rm -f /home/$EC2_USER/frontend-build.tar.gz

    # Reload Nginx
    echo 'Reloading Nginx...'
    sudo systemctl reload nginx

    # Test the website
    echo 'Testing the website...'
    curl -s -I https://fotods.no | head -n 1
"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Deployment on EC2 failed${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend deployment completed successfully!${NC}"
echo -e "${GREEN}Website is now live at https://fotods.no${NC}"

exit 0 