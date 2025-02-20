#!/bin/bash

# Load configuration if exists
if [ -f "scripts/deploy-config.sh" ]; then
    source scripts/deploy-config.sh
fi

# Use environment variables if set, otherwise use config values
FTP_HOST=${HOSTINGER_FTP_HOST:-$FTP_HOST}
FTP_USER=${HOSTINGER_FTP_USER:-$FTP_USER}
FTP_PASSWORD=${HOSTINGER_FTP_PASSWORD:-$FTP_PASSWORD}
FTP_PATH=${HOSTINGER_FTP_PATH:-$FTP_PATH}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check required variables
if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASSWORD" ]; then
    echo -e "${RED}Error: Missing FTP credentials${NC}"
    echo "Please set the following environment variables or update deploy-config.sh:"
    echo "- HOSTINGER_FTP_HOST or FTP_HOST"
    echo "- HOSTINGER_FTP_USER or FTP_USER"
    echo "- HOSTINGER_FTP_PASSWORD or FTP_PASSWORD"
    exit 1
fi

# Function to check command status
check_status() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}$1 failed!${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}Starting deployment to Hostinger...${NC}"

# Check if we're in the frontend directory
if [ ! -d "src" ]; then
    echo -e "${RED}Error: Must be run from the frontend directory${NC}"
    exit 1
fi

# Clean previous build
echo -e "${YELLOW}Cleaning previous build...${NC}"
rm -rf build
check_status "Clean"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
check_status "npm install"

# Build the project
echo -e "${YELLOW}Building project...${NC}"
npm run build
check_status "Build"

# Update verification file
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S UTC")
echo "Deployment verification file
Timestamp: $TIMESTAMP
Site: $FTP_HOST" > build/verify.txt

# Create temporary files
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FTP_COMMANDS=$(mktemp)
LFTP_SCRIPT=$(mktemp)

# Create FTP commands file
cat > "$FTP_COMMANDS" << EOF
open $FTP_HOST
user $FTP_USER $FTP_PASSWORD
cd $FTP_PATH
mirror -R build/ .
bye
EOF

# Create LFTP script (more reliable than regular FTP)
cat > "$LFTP_SCRIPT" << EOF
set ssl:verify-certificate no
open -u $FTP_USER,$FTP_PASSWORD ftp://$FTP_HOST
cd $FTP_PATH
mirror -R --delete --verbose build/ .
EOF

echo -e "${YELLOW}Uploading files to Hostinger...${NC}"

# Try LFTP first, fall back to regular FTP if not available
if command -v lftp >/dev/null 2>&1; then
    lftp -f "$LFTP_SCRIPT"
    check_status "LFTP upload"
else
    ftp -n < "$FTP_COMMANDS"
    check_status "FTP upload"
fi

# Clean up temporary files
rm -f "$FTP_COMMANDS" "$LFTP_SCRIPT"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Verifying deployment...${NC}"

# Verify deployment
sleep 5 # Wait for files to be fully processed
curl -s "https://$FTP_HOST/verify.txt"
check_status "Deployment verification"

echo -e "${GREEN}Deployment verified successfully!${NC}"
echo -e "${YELLOW}Please check the following URLs:${NC}"
echo "1. Main site: https://$FTP_HOST"
echo "2. Verification file: https://$FTP_HOST/verify.txt"
echo "3. Gallery sections: https://$FTP_HOST/gallery"

# Add deployment record
DEPLOY_LOG="scripts/deploy-history.log"
echo "[$TIMESTAMP] Deployment completed successfully" >> "$DEPLOY_LOG" 