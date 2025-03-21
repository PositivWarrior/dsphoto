#!/bin/bash

# Create the updated ecosystem.config.cjs file
cat > updated-ecosystem.cjs << 'EOL'
module.exports = {
        apps: [
                {
                        name: "dsphoto-backend",
                        script: "server.js",
                        instances: 1,
                        exec_mode: "fork",
                        autorestart: true,
                        watch: false,
                        max_memory_restart: "1G",
                        exp_backoff_restart_delay: 100,
                        max_restarts: 10,
                        restart_delay: 1000,
                        listen_timeout: 50000,
                        kill_timeout: 5000,
                        env: {
                                NODE_ENV: "production",
                                PORT: 8000,
                                MONGO_URI:
                                        "mongodb+srv://kacpermargol:GOhK1uGCnCuD46bH@dsphoto.frnfj.mongodb.net/dsphoto?retryWrites=true&w=majority",
                                AWS_ACCESS_KEY_ID: "AKIAZ7SAKWFJ7KXEQIO3",
                                AWS_SECRET_ACCESS_KEY:
                                        "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",
                                AWS_BUCKET_NAME: "ds-photo",
                                AWS_REGION: "eu-north-1",
                                JWT_SECRET: "Niepokonani8",
                        },
                        error_file: "/home/ubuntu/.pm2/logs/dsphoto-backend-error.log",
                        out_file: "/home/ubuntu/.pm2/logs/dsphoto-backend-out.log",
                        time: true,
                },
        ],
};
EOL

# Upload the file to the server
scp -i fotods-kp.pem updated-ecosystem.cjs ubuntu@51.21.110.161:/home/ubuntu/updated-ecosystem.cjs

# Replace the existing file on the server and restart the service
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "sudo cp /home/ubuntu/updated-ecosystem.cjs /var/www/dsphoto-backend/ecosystem.config.cjs && cd /var/www/dsphoto-backend && pm2 stop all && pm2 start ecosystem.config.cjs --update-env && pm2 save"

# Clean up the local file
rm updated-ecosystem.cjs

echo "Ecosystem file updated and service restarted" 