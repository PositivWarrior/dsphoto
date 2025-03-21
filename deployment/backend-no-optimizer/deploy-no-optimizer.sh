#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create temp directory
echo "Preparing files for deployment..."
mkdir -p temp_deploy

# Copy necessary files to deploy directory
cp -r backend/controllers temp_deploy/ || { echo -e "${RED}Failed to copy controllers${NC}"; exit 1; }
cp -r backend/config temp_deploy/ || { echo -e "${RED}Failed to copy config${NC}"; exit 1; }
cp -r backend/middleware temp_deploy/ || { echo -e "${RED}Failed to copy middleware${NC}"; exit 1; }
cp -r backend/models temp_deploy/ || { echo -e "${RED}Failed to copy models${NC}"; exit 1; }

# Copy the modified imageRoutes.js without the optimizer
mkdir -p temp_deploy/routes
cp backend/routes/*.js temp_deploy/routes/ || { echo -e "${RED}Failed to copy routes${NC}"; exit 1; }
cp backend-no-optimizer/routes/imageRoutes.js temp_deploy/routes/ || { echo -e "${RED}Failed to copy modified imageRoutes${NC}"; exit 1; }

# Copy server.js and package files
cp backend/server.js temp_deploy/ || { echo -e "${RED}Failed to copy server.js${NC}"; exit 1; }
cp backend/package.json temp_deploy/ || { echo -e "${RED}Failed to copy package.json${NC}"; exit 1; }
cp backend/package-lock.json temp_deploy/ || { echo -e "${RED}Failed to copy package-lock.json${NC}"; exit 1; }

# Copy assets directory if it exists
if [ -d "backend/assets" ]; then
    echo "Copied assets directory to deployment package"
    cp -r backend/assets temp_deploy/
fi

# Copy environment file
cp backend/.env.production temp_deploy/.env || echo -e "${YELLOW}Warning: No .env file found${NC}"

# Clean up unnecessary files
echo "Cleaning up unnecessary files..."
find temp_deploy -name "*.test.js" -type f -delete

# Upload to EC2
echo "Copying files to EC2..."
scp -i fotods-kp.pem -r temp_deploy/* ubuntu@51.21.110.161:/var/www/dsphoto-backend/

# Set up application on EC2
echo "Setting up application on EC2..."
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "
    # Create necessary directories
    echo 'Creating application directory...'
    mkdir -p /var/www/dsphoto-backend

    # Copy files to the application directory
    echo 'Copying files to application directory...'

    # Install dependencies
    echo 'Installing dependencies...'
    cd /var/www/dsphoto-backend
    npm install

    # Restart the application with PM2
    echo 'Restarting application with PM2...'
    pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend
    pm2 save
    pm2 startup
    pm2 save

    # Apply CORS fix if needed
    echo 'Applying CORS fix...'
    sudo service nginx restart
    sudo nginx -t

    # Check running processes
    echo 'Checking running processes:'
    pm2 status

    # Verify Nginx configuration
    echo 'Verifying Nginx configuration:'
    sudo nginx -t
"

# Clean up temp directory
echo "Cleaning up temporary directory..."
rm -rf temp_deploy

echo -e "${GREEN}Deployment to AWS EC2 completed successfully!${NC}" 