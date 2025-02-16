#!/bin/bash

# Log file for debugging
LOGFILE="/home/u432051507/startup.log"
touch "$LOGFILE"
chmod 644 "$LOGFILE"

# Function to log messages
log_message() {
    echo "$(date): $1" >> "$LOGFILE"
}

# Function to start the application
start_application() {
    cd /home/u432051507/domains/fotods.no/public_html/api
    if ! command -v pm2 &> /dev/null; then
        log_message "Installing PM2..."
        npm install pm2@latest -g
    fi

    log_message "Starting application..."
    pm2 delete dsphoto-api 2>/dev/null || true
    pm2 start ecosystem.config.cjs
    pm2 save --force
}

# Function to check if application is running
check_application() {
    if ! curl -s http://localhost:8000/debug > /dev/null; then
        log_message "Application not responding, restarting..."
        start_application
    fi
}

# Initial start
start_application

# Monitor and restart if needed
while true; do
    check_application
    sleep 60  # Check every minute
done 