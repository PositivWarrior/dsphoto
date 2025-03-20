#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Error handling
set -e
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
trap 'echo -e "${RED}\"${last_command}\" command failed with exit code $?.${NC}"' EXIT

# Function to check DNS resolution
check_dns() {
    local domain=$1
    echo -e "${YELLOW}Checking DNS resolution for ${domain}...${NC}"
    
    # Get server's public IP
    local server_ip="51.21.110.161"
    echo -e "${YELLOW}Server IP: $server_ip${NC}"
    
    # Try multiple DNS resolvers
    local resolvers=("8.8.8.8" "1.1.1.1" "208.67.222.222")
    local domain_ip=""
    
    for resolver in "${resolvers[@]}"; do
        echo -e "${YELLOW}Trying DNS resolver: $resolver${NC}"
        domain_ip=$(dig @$resolver +short $domain A || nslookup $domain $resolver 2>/dev/null | grep "Address:" | tail -n1 | awk '{print $2}')
        
        if [ ! -z "$domain_ip" ]; then
            echo -e "${YELLOW}Resolved IP using $resolver: $domain_ip${NC}"
            break
        fi
    done
    
    if [ -z "$domain_ip" ]; then
        echo -e "${RED}Could not resolve domain ${domain} using any DNS resolver${NC}"
        echo -e "${YELLOW}Please ensure DNS is properly configured:${NC}"
        echo "1. Log into Hostinger control panel"
        echo "2. Go to DNS management for fotods.no"
        echo "3. Add/update A record for 'api' subdomain to point to: $server_ip"
        echo "4. Remove any existing CNAME records for 'api' subdomain"
        echo "5. Wait 15-30 minutes for DNS changes to propagate"
        return 1
    fi
    
    if [ "$domain_ip" != "$server_ip" ]; then
        echo -e "${RED}Domain ${domain} points to $domain_ip instead of $server_ip${NC}"
        echo -e "${YELLOW}Please update your DNS A record in Hostinger to point to ${server_ip}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}DNS check passed for ${domain}${NC}"
    return 0
}

# Function to check if a port is open
check_port() {
    local port=$1
    if ! nc -zv -w5 localhost $port 2>/dev/null; then
        echo -e "${RED}Port $port is not open locally${NC}"
        return 1
    fi
    echo -e "${GREEN}Port $port is open locally${NC}"
    return 0
}

echo -e "${YELLOW}Checking backend service status...${NC}"

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
sudo apt-get update
sudo apt-get install -y dnsutils curl nginx certbot netcat-openbsd ufw

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# Check MongoDB connection
echo -e "${YELLOW}Checking MongoDB connection...${NC}"
if ! mongosh "mongodb+srv://kacpermargol:GOhK1uGCnCuD46bH@dsphoto.frnfj.mongodb.net/dsphoto" --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${RED}MongoDB connection failed. Please check your connection string and network.${NC}"
    exit 1
fi
echo -e "${GREEN}MongoDB connection successful.${NC}"

# Check if PM2 is running
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed. Installing...${NC}"
    sudo npm install -g pm2
fi

# Check backend directory and files
BACKEND_DIR="/var/www/dsphoto-backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Backend directory not found. Creating...${NC}"
    sudo mkdir -p "$BACKEND_DIR"
    sudo chown -R ubuntu:ubuntu "$BACKEND_DIR"
fi

# Check if the backend service is running
if ! pm2 list | grep -q "dsphoto-backend"; then
    echo -e "${RED}Backend service is not running. Starting...${NC}"
    cd "$BACKEND_DIR"
    if [ ! -f "server.js" ]; then
        echo -e "${RED}server.js not found. Please ensure all backend files are properly deployed.${NC}"
        exit 1
    fi
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    pm2 start server.js --name dsphoto-backend
else
    echo -e "${GREEN}Backend service is running.${NC}"
    # Restart the service to ensure clean state
    pm2 restart dsphoto-backend
fi

# Save PM2 process list
pm2 save

# Check DNS before proceeding with SSL
if ! check_dns "api.fotods.no"; then
    echo -e "${RED}Please configure DNS before proceeding with SSL setup${NC}"
    echo "The domain api.fotods.no must point to this server's IP address"
    exit 1
fi

# Stop Nginx and remove existing configuration
echo -e "${YELLOW}Stopping Nginx and removing existing configuration...${NC}"
sudo systemctl stop nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/dsphoto-backend
sudo rm -f /etc/nginx/sites-available/dsphoto-backend

# Disable IPv6 temporarily for Certbot
echo -e "${YELLOW}Temporarily disabling IPv6...${NC}"
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1

# Ensure port 80 is free
echo -e "${YELLOW}Ensuring port 80 is free...${NC}"
sudo fuser -k 80/tcp || true
sleep 5

# Add IPv4-only DNS record to hosts file temporarily
echo -e "${YELLOW}Adding IPv4-only DNS record to hosts file...${NC}"
sudo sed -i '/api\.fotods\.no/d' /etc/hosts
sudo sed -i '/ec2-51-21-110-161/d' /etc/hosts
echo "51.21.110.161 api.fotods.no ec2-51-21-110-161.eu-north-1.compute.amazonaws.com" | sudo tee -a /etc/hosts

# Create a temporary site configuration
echo -e "${YELLOW}Creating temporary site configuration...${NC}"
sudo tee /etc/nginx/sites-available/certbot-temp << 'EOF'
server {
    listen 80;
    server_name api.fotods.no;
    root /var/www/html;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
        allow all;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Enable the site and set up directories
echo -e "${YELLOW}Setting up web server...${NC}"
sudo ln -sf /etc/nginx/sites-available/certbot-temp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html/.well-known
sudo chmod -R 755 /var/www/html/.well-known

# Test Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
if ! sudo nginx -t; then
    echo -e "${RED}Nginx configuration test failed${NC}"
    exit 1
fi

# Start Nginx
echo -e "${YELLOW}Starting Nginx...${NC}"
sudo systemctl start nginx

# Wait for Nginx to start
echo -e "${YELLOW}Waiting for Nginx to start...${NC}"
sleep 5

# Test if Nginx is serving requests
echo -e "${YELLOW}Testing if Nginx is serving requests...${NC}"
if ! curl -s http://localhost/ > /dev/null; then
    echo -e "${RED}Nginx is not serving requests properly${NC}"
    sudo systemctl status nginx
    sudo tail -n 50 /var/log/nginx/error.log
    exit 1
fi

echo -e "${GREEN}Nginx is serving requests properly${NC}"

# Test ACME challenge directory
echo -e "${YELLOW}Testing ACME challenge directory...${NC}"
echo "test" | sudo tee /var/www/html/.well-known/acme-challenge/test > /dev/null
if ! curl -s http://localhost/.well-known/acme-challenge/test | grep -q "test"; then
    echo -e "${RED}ACME challenge directory is not accessible${NC}"
    sudo ls -la /var/www/html/.well-known/acme-challenge/
    sudo tail -n 50 /var/log/nginx/error.log
    exit 1
fi

echo -e "${GREEN}ACME challenge directory is accessible${NC}"

# Wait for DNS propagation
echo -e "${YELLOW}Waiting for DNS propagation (30 seconds)...${NC}"
sleep 30

# Obtain SSL certificate using webroot mode
echo -e "${YELLOW}Obtaining SSL certificate using webroot mode...${NC}"
if ! sudo certbot certonly --webroot -w /var/www/html -d api.fotods.no --non-interactive --agree-tos --email info@fotods.no --preferred-challenges http; then
    echo -e "${RED}Failed to obtain SSL certificate${NC}"
    echo -e "${YELLOW}Checking Certbot logs...${NC}"
    sudo tail -n 50 /var/log/letsencrypt/letsencrypt.log
    exit 1
fi

# Create final Nginx configuration with SSL
echo -e "${YELLOW}Creating Nginx configuration with SSL...${NC}"
sudo tee /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name api.fotods.no;
    root /var/www/html;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
        allow all;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.fotods.no;

    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header "Access-Control-Allow-Credentials" "true" always;
        add_header "Access-Control-Max-Age" "1728000" always;

        if ($request_method = "OPTIONS") {
            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
            add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
            add_header "Access-Control-Allow-Credentials" "true" always;
            add_header "Access-Control-Max-Age" "1728000" always;
            add_header "Content-Type" "text/plain charset=UTF-8";
            add_header "Content-Length" "0";
            return 204;
        }
    }

    location /assets/ {
        alias /var/www/dsphoto-backend/assets/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
    }
}
EOF

# Enable the site
echo -e "${YELLOW}Enabling Nginx site...${NC}"
sudo ln -sf /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-enabled/

# Verify Nginx configuration
echo -e "${YELLOW}Verifying Nginx configuration...${NC}"
if ! sudo nginx -t; then
    echo -e "${RED}Nginx configuration test failed${NC}"
    exit 1
fi

# Create and configure assets directory
echo -e "${YELLOW}Setting up assets directory...${NC}"
sudo mkdir -p "$BACKEND_DIR/assets"
sudo chown -R ubuntu:ubuntu "$BACKEND_DIR"
sudo chmod -R 755 "$BACKEND_DIR"

# Start Nginx
echo -e "${YELLOW}Starting Nginx...${NC}"
sudo systemctl start nginx

# Final check of the backend API
echo -e "${YELLOW}Testing backend API...${NC}"
if ! curl -sk https://api.fotods.no/debug > /dev/null; then
    echo -e "${RED}Backend API test failed. Please check the logs:${NC}"
    pm2 logs dsphoto-backend --lines 50
    exit 1
fi

echo -e "${GREEN}Backend check and fix completed successfully!${NC}"
echo -e "${YELLOW}Please check the following endpoints:${NC}"
echo "1. API Health: https://api.fotods.no"
echo "2. Debug Info: https://api.fotods.no/debug"
echo "3. Images: https://api.fotods.no/images"

# Remove the error handling trap
trap - EXIT 