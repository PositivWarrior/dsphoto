#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting frontend build process...${NC}"

# Navigate to frontend directory
cd frontend

# Build for production
echo -e "${YELLOW}Building frontend for production...${NC}"
GENERATE_SOURCEMAP=false npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Check the errors above.${NC}"
    exit 1
fi

# Create a directory for extraction
BUILD_DIR="../build-for-upload"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Copy build files to the extraction directory
cp -r build/* $BUILD_DIR/

echo -e "${GREEN}Frontend build completed!${NC}"
echo -e "${GREEN}Files are ready in the ${BUILD_DIR} directory${NC}"
echo -e "${YELLOW}You can now upload these files to your server using FileZilla.${NC}"
echo -e "${YELLOW}Server path: /var/www/dsphoto-frontend/${NC}"

# List build directory size
BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
echo -e "${GREEN}Build size: ${BUILD_SIZE}${NC}"

exit 0 