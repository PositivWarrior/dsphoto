#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -y pm2@latest -g

# Install nginx
sudo apt install -y nginx

# Create app directory
sudo mkdir -p /var/www/dsphoto-backend
sudo chown -R $USER:$USER /var/www/dsphoto-backend

# Copy application files
# Note: You'll need to manually copy your files first time
cd /var/www/dsphoto-backend

# Install dependencies
npm install

# Setup PM2 startup script
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# Start the application with PM2
pm2 start ecosystem.config.cjs --env production
pm2 save

# Configure Nginx
sudo tee /etc/nginx/sites-available/dsphoto-backend << EOF
server {
    listen 80;
    server_name api.fotods.no;  # Replace with your API domain

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable the Nginx site
sudo ln -s /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.fotods.no  # Replace with your API domain 