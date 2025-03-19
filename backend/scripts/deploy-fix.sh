#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying Nginx fix to backend server...${NC}"

# Check if fix-nginx.sh exists
if [ ! -f "backend/scripts/fix-nginx.sh" ]; then
    echo -e "${RED}Error: fix-nginx.sh script not found!${NC}"
    exit 1
fi

# Copy script to server
echo -e "${YELLOW}Copying fix script to server...${NC}"
scp -i fotods-kp.pem backend/scripts/fix-nginx.sh ubuntu@51.21.110.161:/tmp/fix-nginx.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to copy script to server!${NC}"
    exit 1
fi

# Execute script on server
echo -e "${YELLOW}Running fix script on server...${NC}"
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "chmod +x /tmp/fix-nginx.sh && sudo /tmp/fix-nginx.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to run fix script on server!${NC}"
    exit 1
fi

echo -e "${GREEN}Backend server Nginx configuration has been updated!${NC}"
echo -e "${YELLOW}Testing CORS and upload functionality...${NC}"

# Test CORS headers
echo -e "${YELLOW}Testing CORS headers...${NC}"
curl -I -H "Origin: https://fotods.no" https://api.fotods.no

echo ""
echo -e "${GREEN}All fixed! You should now be able to upload larger images without CORS errors.${NC}" 