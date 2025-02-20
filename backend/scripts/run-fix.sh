#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the project root directory (two levels up from the script location)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
KEY_FILE="$PROJECT_ROOT/fotods-kp.pem"

# Check if the key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}Error: fotods-kp.pem key file not found${NC}"
    echo "Please make sure the key file is in the project root directory: $PROJECT_ROOT"
    exit 1
fi

# Copy the check-and-fix script to the server
echo -e "${YELLOW}Copying fix script to server...${NC}"
scp -i "$KEY_FILE" "$(dirname "${BASH_SOURCE[0]}")/check-and-fix.sh" ubuntu@51.21.110.161:/tmp/

# Make the script executable and run it
echo -e "${YELLOW}Running fix script on server...${NC}"
ssh -i "$KEY_FILE" ubuntu@51.21.110.161 "chmod +x /tmp/check-and-fix.sh && sudo /tmp/check-and-fix.sh"

echo -e "${GREEN}Fix script completed!${NC}" 