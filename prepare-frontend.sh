#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing frontend for Hostinger from last stable build...${NC}"

# Create a directory for the extracted files
mkdir -p stable-frontend-build

# Extract the optimized frontend build
tar -xzf frontend-optimized.tar.gz -C stable-frontend-build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully extracted stable frontend build to 'stable-frontend-build' directory${NC}"
    echo -e "${YELLOW}You can now upload these files to Hostinger using FileZilla${NC}"
else
    echo -e "${RED}Error extracting frontend build. Please check if the archive is valid.${NC}"
    exit 1
fi 