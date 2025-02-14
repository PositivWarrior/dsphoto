#!/bin/bash

# Clean up any existing deploy directory and zip
rm -rf deploy deploy.zip 2>/dev/null

# Create deployment directory
mkdir -p deploy/api

# Copy necessary files
cp -r \
    controllers \
    config \
    middleware \
    models \
    routes \
    server.js \
    package.json \
    package-lock.json \
    .htaccess \
    deploy/api/

# Create production .env file template
cat > deploy/api/.env << EOL
NODE_ENV=production
MONGO_URI=${MONGO_URI}
PORT=8000
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
AWS_REGION=${AWS_REGION}
JWT_SECRET=${JWT_SECRET}
EOL

# Create zip file
cd deploy
zip -r ../deploy.zip ./*
cd ..

echo "Deployment package created as deploy.zip"
echo "Upload the contents of deploy/api to your public_html/api directory" 