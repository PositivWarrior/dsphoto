#!/bin/bash

# Log file for debugging
LOGFILE="/home/u432051507/startup.log"
APP_DIR="/home/u432051507/domains/fotods.no/public_html/api"
PM2_PATH="/home/u432051507/.nvm/versions/node/v18.20.6/lib/node_modules/pm2/bin/pm2"

# Ensure log file exists and has correct permissions
touch "$LOGFILE"
chmod 644 "$LOGFILE"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOGFILE"
}

# Function to check if PM2 is running
check_pm2() {
    if ! pgrep -f "PM2" > /dev/null; then
        log_message "PM2 daemon not running. Starting PM2..."
        $PM2_PATH resurrect
        sleep 5
    fi
}

# Function to start the application
start_application() {
    cd "$APP_DIR" || {
        log_message "Failed to change to application directory"
        return 1
    }

    log_message "Stopping any existing processes..."
    $PM2_PATH delete dsphoto-api 2>/dev/null || true
    
    log_message "Starting application with PM2..."
    $PM2_PATH start ecosystem.config.cjs || {
        log_message "Failed to start application"
        return 1
    }
    
    log_message "Saving PM2 process list..."
    $PM2_PATH save --force || {
        log_message "Failed to save PM2 process list"
        return 1
    }

    log_message "Application started successfully"
    return 0
}

# Function to check application health
check_application() {
    if ! curl -s http://localhost:8000/debug > /dev/null; then
        log_message "Application not responding, attempting restart..."
        start_application
    fi
}

# Main execution
log_message "=== Starting monitoring script ==="

# Initial startup
check_pm2
start_application

# Continuous monitoring
while true; do
    check_pm2
    check_application
    sleep 60
done 