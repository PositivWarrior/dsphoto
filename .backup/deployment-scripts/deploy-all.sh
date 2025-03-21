#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="../fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Function for building the frontend
build_frontend() {
    echo -e "${YELLOW}Building frontend...${NC}"
    cd ../frontend
    GENERATE_SOURCEMAP=false npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}Frontend build failed. Exiting.${NC}"
        exit 1
    }
    cd - > /dev/null
    echo -e "${GREEN}Frontend build completed.${NC}"
}

# Function for deploying the frontend
deploy_frontend() {
    echo -e "${YELLOW}Deploying frontend to EC2...${NC}"
    
    # Create archive of the frontend build
    cd ../frontend
    tar -czf ../frontend-build.tar.gz build
    cd - > /dev/null
    
    # Upload the frontend
    scp -i $PEM_FILE ../frontend-build.tar.gz $EC2_USER@$EC2_HOST:/home/$EC2_USER/frontend-build.tar.gz
    
    # Deploy on the server
    ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
        # Extract the frontend
        sudo rm -rf /var/www/dsphoto-frontend_backup
        sudo mv /var/www/dsphoto-frontend /var/www/dsphoto-frontend_backup 2>/dev/null || true
        sudo mkdir -p /var/www/dsphoto-frontend
        sudo tar -xzf /home/$EC2_USER/frontend-build.tar.gz -C /var/www/dsphoto-frontend --strip-components=1
        sudo chown -R www-data:www-data /var/www/dsphoto-frontend
        sudo chmod -R 755 /var/www/dsphoto-frontend
        rm -f /home/$EC2_USER/frontend-build.tar.gz
    "
    
    # Clean up
    rm -f ../frontend-build.tar.gz
    
    echo -e "${GREEN}Frontend deployed successfully.${NC}"
}

# Function for deploying the backend
deploy_backend() {
    echo -e "${YELLOW}Deploying backend to EC2...${NC}"
    
    # Create archive of the backend
    cd ../backend
    tar --exclude="node_modules" --exclude=".git" -czf ../backend-build.tar.gz .
    cd - > /dev/null
    
    # Upload the backend
    scp -i $PEM_FILE ../backend-build.tar.gz $EC2_USER@$EC2_HOST:/home/$EC2_USER/backend-build.tar.gz
    
    # Deploy on the server
    ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
        # Extract the backend
        sudo rm -rf /var/www/dsphoto-backend_backup
        sudo mv /var/www/dsphoto-backend /var/www/dsphoto-backend_backup 2>/dev/null || true
        sudo mkdir -p /var/www/dsphoto-backend
        sudo tar -xzf /home/$EC2_USER/backend-build.tar.gz -C /var/www/dsphoto-backend
        sudo chown -R www-data:www-data /var/www/dsphoto-backend
        sudo chmod -R 755 /var/www/dsphoto-backend
        
        # Install dependencies
        cd /var/www/dsphoto-backend
        sudo npm install --omit=dev
        
        # Restart the backend service with PM2
        sudo pm2 restart dsphoto-backend || sudo pm2 start server.js --name dsphoto-backend
        sudo pm2 save
        
        # Clean up
        rm -f /home/$EC2_USER/backend-build.tar.gz
    "
    
    # Clean up
    rm -f ../backend-build.tar.gz
    
    echo -e "${GREEN}Backend deployed successfully.${NC}"
}

# Function for applying CORS fixes
fix_cors() {
    echo -e "${YELLOW}Applying CORS fixes...${NC}"
    
    # Create Nginx configuration
    cat > nginx-cors-fix.conf << 'EOF'
server {
    listen 80;
    server_name api.fotods.no;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.fotods.no;
    
    # Increase client body size limit for large uploads
    client_max_body_size 50M;
    
    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OPTIONS method handler for preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '1728000' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' '0';
        return 204;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for non-OPTIONS requests
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Proxy CORS headers from the application server
        proxy_pass_header Access-Control-Allow-Origin;
        proxy_pass_header Access-Control-Allow-Methods;
        proxy_pass_header Access-Control-Allow-Headers; 
        proxy_pass_header Access-Control-Allow-Credentials;
    }
    
    location /assets/ {
        alias /var/www/dsphoto-backend/assets/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

    # Create backend CORS fix script
    cat > backend-cors-fix.js << 'EOF'
// CORS configuration
const corsOptions = {
    origin: 'https://fotods.no',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
    ],
    credentials: true,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
EOF

    # Upload the fixes
    scp -i $PEM_FILE nginx-cors-fix.conf backend-cors-fix.js $EC2_USER@$EC2_HOST:/home/$EC2_USER/

    # Apply the fixes on the server
    ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
        # Apply Nginx fix
        sudo cp /home/$EC2_USER/nginx-cors-fix.conf /etc/nginx/sites-available/dsphoto-backend
        sudo nginx -t
        if [ \$? -eq 0 ]; then
            sudo systemctl restart nginx
            echo 'Nginx configuration applied successfully.'
        else
            echo 'Error in Nginx configuration. Please check manually.'
            exit 1
        fi
        
        # Apply backend CORS fix
        cd /var/www/dsphoto-backend
        sudo cp server.js server.js.bak
        
        # Update server.js with the CORS configuration
        if ! grep -q 'app.options.*cors(corsOptions)' server.js; then
            # Find where cors is used
            CORS_LINE=\$(grep -n 'app.use(cors' server.js | head -n 1 | cut -d ':' -f1)
            if [ -n \"\$CORS_LINE\" ]; then
                # Insert the CORS options after this line
                sudo sed -i \"\${CORS_LINE}r /home/\$USER/backend-cors-fix.js\" server.js
                echo 'CORS configuration applied to backend.'
                
                # Restart the backend
                sudo pm2 restart dsphoto-backend
                sudo pm2 save
            else
                echo 'Could not locate CORS usage in server.js'
            fi
        fi
        
        # Clean up
        rm -f /home/$EC2_USER/nginx-cors-fix.conf /home/$EC2_USER/backend-cors-fix.js
        
        # Test the APIs
        echo 'Testing API CORS headers:'
        curl -s -I -X OPTIONS -H 'Origin: https://fotods.no' -H 'Access-Control-Request-Method: GET' https://api.fotods.no/images | grep -i 'access-control'
    "
    
    # Clean up local files
    rm -f nginx-cors-fix.conf backend-cors-fix.js
    
    echo -e "${GREEN}CORS fixes applied successfully.${NC}"
}

# Main deployment process
echo -e "${YELLOW}Starting deployment process...${NC}"

# Ask which components to deploy
echo -e "${YELLOW}Which components do you want to deploy?${NC}"
echo "1) Frontend only"
echo "2) Backend only"
echo "3) CORS fixes only"
echo "4) All components"
read -p "Enter your choice (1-4): " CHOICE

case $CHOICE in
    1)
        build_frontend
        deploy_frontend
        ;;
    2)
        deploy_backend
        ;;
    3)
        fix_cors
        ;;
    4)
        build_frontend
        deploy_frontend
        deploy_backend
        fix_cors
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}Deployment completed successfully!${NC}"
exit 0 