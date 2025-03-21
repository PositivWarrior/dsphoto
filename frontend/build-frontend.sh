#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting frontend build process...${NC}"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm ci
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies. Exiting.${NC}"
        exit 1
    fi
fi

# Clean the build directory if it exists
if [ -d "build" ]; then
    echo -e "${YELLOW}Cleaning previous build...${NC}"
    rm -rf build
fi

# Build for production
echo -e "${YELLOW}Building frontend for production...${NC}"
GENERATE_SOURCEMAP=false npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Check the errors above.${NC}"
    exit 1
fi

# Verify the build directory
if [ ! -d "build" ]; then
    echo -e "${RED}Build directory was not created. Build may have failed.${NC}"
    exit 1
fi

# Count files in build directory
FILE_COUNT=$(find build -type f | wc -l)
echo -e "${GREEN}Build completed successfully with ${FILE_COUNT} files.${NC}"

# Create deployment archive
echo -e "${YELLOW}Creating deployment archive...${NC}"
tar -czf frontend-build.tar.gz build
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create deployment archive.${NC}"
    exit 1
fi

# Move the archive to the parent directory for easier access
mv frontend-build.tar.gz ../
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to move the deployment archive.${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend build completed successfully!${NC}"
echo -e "${GREEN}Deployment archive created at ../frontend-build.tar.gz${NC}"
echo -e "${YELLOW}To deploy, run: scp ../frontend-build.tar.gz user@server:/path/to/deployment${NC}"

# List frontend build size
ARCHIVE_SIZE=$(du -h ../frontend-build.tar.gz | cut -f1)
echo -e "${GREEN}Deployment archive size: ${ARCHIVE_SIZE}${NC}"

exit 0 