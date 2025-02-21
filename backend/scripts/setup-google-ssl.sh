#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create SSL directory
echo -e "${YELLOW}Creating SSL directory...${NC}"
sudo mkdir -p /etc/ssl/fotods.no
sudo chmod 700 /etc/ssl/fotods.no

echo -e "${YELLOW}Please follow these steps:${NC}"
echo "1. Log in to your Hostinger control panel"
echo "2. Go to SSL section for fotods.no"
echo "3. Download the Google SSL certificate files"
echo "4. Create these files on your local machine:"
echo "   - certificate.crt (Certificate)"
echo "   - private.key (Private Key)"
echo "5. Upload them using this command:"
echo -e "${GREEN}scp -i fotods-kp.pem certificate.crt private.key ubuntu@51.21.110.161:/home/ubuntu/ssl-temp/${NC}"
echo "6. Then run this script again to move them to the correct location"

# Check if files exist in temporary location
if [ -f /home/ubuntu/ssl-temp/certificate.crt ] && [ -f /home/ubuntu/ssl-temp/private.key ]; then
    echo -e "${YELLOW}Moving SSL files to correct location...${NC}"
    sudo mv /home/ubuntu/ssl-temp/certificate.crt /etc/ssl/fotods.no/
    sudo mv /home/ubuntu/ssl-temp/private.key /etc/ssl/fotods.no/
    sudo chmod 600 /etc/ssl/fotods.no/private.key
    sudo chmod 644 /etc/ssl/fotods.no/certificate.crt
    sudo chown root:root /etc/ssl/fotods.no/*
    echo -e "${GREEN}SSL files installed successfully!${NC}"
    
    # Verify Nginx config and restart
    echo -e "${YELLOW}Testing Nginx configuration...${NC}"
    sudo nginx -t && sudo systemctl restart nginx
else
    echo -e "${YELLOW}SSL files not found in /home/ubuntu/ssl-temp/${NC}"
    echo "Please upload the files first, then run this script again"
    mkdir -p /home/ubuntu/ssl-temp
fi 