#!/bin/bash

# Configuration
REMOTE_USER="u432051507"
REMOTE_HOST="145.223.91.230"
REMOTE_PORT="65002"
REMOTE_PATH="/home/u432051507/domains/fotods.no/public_html/api"

# Clean up any existing deploy directory
rm -rf deploy 2>/dev/null

# Create deployment directory
mkdir -p deploy

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
    ecosystem.config.cjs \
    deploy/

# Create production .env file
cat > deploy/.env << EOL
NODE_ENV=production
MONGO_URI=mongodb+srv://kacpermargol:GOhK1uGCnCuD46bH@dsphoto.frnfj.mongodb.net/dsphoto?retryWrites=true&w=majority
PORT=8000
AWS_ACCESS_KEY_ID=AKIAZ7SAKWFJ7KXEQIO3
AWS_SECRET_ACCESS_KEY=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
AWS_BUCKET_NAME=ds-photo
AWS_REGION=eu-north-1
JWT_SECRET=Niepokonani8
EOL

# Upload files to server
echo "Uploading files to server..."
scp -P $REMOTE_PORT -r deploy/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Execute remote commands
ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && \
    npm install && \
    npm install pm2 -g && \
    pm2 delete dsphoto-api 2>/dev/null || true && \
    pm2 start ecosystem.config.cjs && \
    pm2 save && \
    pm2 startup"

echo "Deployment completed!" 



#!/bin/bash

# Navigate to API directory
# cd /home/u432051507/domains/fotods.no/public_html/api

# Install dependencies
# npm install --production

# Start/Restart PM2
# pm2 delete dsphoto-api
# pm2 start ecosystem.config.js
# pm2 save
# pm2 startup