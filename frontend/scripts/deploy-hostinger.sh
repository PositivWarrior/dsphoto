#!/bin/bash

# Configuration
FTP_HOST="145.223.91.230"
FTP_USER="u432051507.fotods.no"  # Corrected Hostinger FTP username
FTP_PASS=".Niepokonani8"  # Added FTP password
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

echo -e "${YELLOW}Uploading files to Hostinger...${NC}"

# Create a list of files to upload
find build -type f > files_to_upload.txt

# Upload each file individually using curl
while IFS= read -r file; do
    # Get the relative path for the destination
    rel_path="${file#build/}"
    echo "Uploading $file to $FTP_PATH/$rel_path"
    
    # Create the directory structure if needed
    dir_path=$(dirname "$rel_path")
    if [ "$dir_path" != "." ]; then
        # Create the directory structure
        curl -s --ftp-create-dirs -u "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST/$FTP_PATH/$dir_path/" || true
    fi
    
    # Upload the file
    curl -T "$file" -u "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST/$FTP_PATH/$rel_path"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to upload $file${NC}"
    fi
done < files_to_upload.txt

# Clean up
rm files_to_upload.txt

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

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

curl -I -H "Origin: https://fotods.no" https://api.fotods.no