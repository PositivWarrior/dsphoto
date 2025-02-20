#!/bin/bash

# Configuration
FTP_HOST="fotods.no"
FTP_USER="u123456789"  # Replace with your Hostinger FTP username
FTP_PATH="/public_html"
BUILD_DIR="build"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S UTC")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Hostinger...${NC}"

# Check if we're in the frontend directory
if [ ! -d "src" ]; then
    echo -e "${RED}Error: Must be run from the frontend directory${NC}"
    exit 1
fi

# Build the project
echo -e "${YELLOW}Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Update verification file
echo "Deployment verification file
Timestamp: $TIMESTAMP
Site: fotods.no" > build/verify.txt

# Create a temporary script for FTP commands
echo "#!/bin/bash
echo 'open $FTP_HOST'
echo 'user $FTP_USER'
echo 'prompt off'
echo 'cd $FTP_PATH'
echo 'mput build/*'
echo 'mput build/.htaccess'
echo 'bye'" > deploy-ftp.tmp

# Make the script executable
chmod +x deploy-ftp.tmp

echo -e "${YELLOW}Uploading files to Hostinger...${NC}"
echo -e "${YELLOW}Please enter your FTP password when prompted${NC}"

# Run the FTP script
ftp -n < deploy-ftp.tmp

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed!${NC}"
    rm deploy-ftp.tmp
    exit 1
fi

# Clean up
rm deploy-ftp.tmp

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Verifying deployment...${NC}"

# Verify deployment
sleep 5 # Wait for files to be fully processed
curl -s https://fotods.no/verify.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}Verification failed! Please check the deployment manually.${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment verified successfully!${NC}"
echo -e "${YELLOW}Please check the following URLs:${NC}"
echo "1. Main site: https://fotods.no"
echo "2. Verification file: https://fotods.no/verify.txt"
echo "3. Gallery sections: https://fotods.no/gallery" 