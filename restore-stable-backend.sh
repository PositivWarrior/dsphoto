#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Restoring backend to last stable version...${NC}"

# SSH command to restore the backup
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "
    # Stop the current PM2 process
    pm2 stop dsphoto-backend

    # Backup current directory just in case
    sudo mv /var/www/dsphoto-backend /var/www/dsphoto-backend.current.bak

    # Restore from the backup from March 20th
    sudo cp -r /var/www/dsphoto-backend_backup_20250320_151756 /var/www/dsphoto-backend
    
    # Set proper permissions
    sudo chown -R ubuntu:ubuntu /var/www/dsphoto-backend
    
    # Copy the correct ecosystem config
    cd /var/www/dsphoto-backend
    
    # Create the updated ecosystem config with port 8000
    cat > ecosystem.config.cjs << 'EOL'
module.exports = {
        apps: [
                {
                        name: \"dsphoto-backend\",
                        script: \"server.js\",
                        instances: 1,
                        exec_mode: \"fork\",
                        autorestart: true,
                        watch: false,
                        max_memory_restart: \"1G\",
                        exp_backoff_restart_delay: 100,
                        max_restarts: 10,
                        restart_delay: 1000,
                        listen_timeout: 50000,
                        kill_timeout: 5000,
                        env: {
                                NODE_ENV: \"production\",
                                PORT: 8000,
                                MONGO_URI:
                                        \"mongodb+srv://kacpermargol:GOhK1uGCnCuD46bH@dsphoto.frnfj.mongodb.net/dsphoto?retryWrites=true&w=majority\",
                                AWS_ACCESS_KEY_ID: \"AKIAZ7SAKWFJ7KXEQIO3\",
                                AWS_SECRET_ACCESS_KEY:
                                        \"rxax9H71DVtZRdUwscTyMidr1Kna15hyZFe4u/gk\",
                                AWS_BUCKET_NAME: \"ds-photo\",
                                AWS_REGION: \"eu-north-1\",
                                JWT_SECRET: \"Niepokonani8\",
                        },
                        error_file: \"/home/ubuntu/.pm2/logs/dsphoto-backend-error.log\",
                        out_file: \"/home/ubuntu/.pm2/logs/dsphoto-backend-out.log\",
                        time: true,
                },
        ],
};
EOL
    
    # Start the application with PM2
    pm2 start ecosystem.config.cjs --update-env
    pm2 save
    
    # Verify Nginx configuration
    sudo nginx -t
    sudo systemctl reload nginx
    
    # Show running processes
    pm2 status
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend successfully restored to last stable version!${NC}"
else
    echo -e "${RED}Error restoring backend. Please check the server logs.${NC}"
    exit 1
fi 