#!/bin/bash

# Navigate to application directory
cd /home/u432051507/domains/fotods.no/public_html/api

# Check if PM2 is installed, if not install it
if ! command -v pm2 &> /dev/null; then
    npm install pm2 -g
fi

# Check if our app is running
pm2 describe dsphoto-api > /dev/null
RUNNING=$?

if [ $RUNNING -ne 0 ]; then
    echo "Server is down, restarting..."
    # Start the application with PM2
    pm2 start ecosystem.config.cjs
    pm2 save --force
else
    # Get the status
    STATUS=$(pm2 describe dsphoto-api | grep status | awk '{print $4}')
    if [ "$STATUS" != "online" ]; then
        echo "Server is not online, restarting..."
        pm2 restart dsphoto-api
        pm2 save --force
    fi
fi

# Log the status
echo "$(date): Server status check completed" >> /home/u432051507/monitor.log 