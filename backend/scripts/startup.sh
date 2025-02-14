#!/bin/bash

# Navigate to application directory
cd /home/u432051507/domains/fotods.no/public_html/api

# Install PM2 globally if not already installed
npm install pm2 -g

# Start the application with PM2
pm2 describe dsphoto-api > /dev/null
RUNNING=$?

if [ $RUNNING -eq 0 ]; then
    echo "Restarting existing PM2 process..."
    pm2 restart dsphoto-api
else
    echo "Starting new PM2 process..."
    pm2 start server.js --name dsphoto-api
fi

# Save process list
pm2 save

echo "PM2 process started and saved" 