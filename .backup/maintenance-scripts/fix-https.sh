#!/bin/bash

# Set up variables
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "Error: PEM file not found at $PEM_FILE"
    exit 1
fi

# Create the script to run on the server
cat > setup-https.sh << 'EOF'
#!/bin/bash

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Obtain and install SSL certificate
echo "Obtaining SSL certificate for api.fotods.no..."
sudo certbot --nginx -d api.fotods.no --non-interactive --agree-tos --email webmaster@fotods.no

# Update Nginx configuration to redirect HTTP to HTTPS
echo "Updating Nginx configuration to force HTTPS..."
sudo tee /etc/nginx/sites-available/api-redirect.conf > /dev/null << 'EOC'
server {
    listen 80;
    server_name api.fotods.no;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}
EOC

# Create symbolic link to enable the new configuration
sudo ln -sf /etc/nginx/sites-available/api-redirect.conf /etc/nginx/sites-enabled/

# Check Nginx configuration
echo "Checking Nginx configuration..."
sudo nginx -t

# If the configuration is valid, reload Nginx
if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    sudo systemctl reload nginx
else
    echo "Error in Nginx configuration. Please check and fix manually."
    exit 1
fi

# Update Express app CORS settings to use HTTPS
echo "Updating Express app CORS settings..."
sudo sed -i "s|http://api.fotods.no|https://api.fotods.no|g" /var/www/dsphoto-backend/server.js

# Restart the backend service
echo "Restarting backend service..."
pm2 restart dsphoto-backend

echo "HTTPS setup completed successfully!"
EOF

# Upload the script to the server
echo "Uploading setup script to server..."
scp -i "$PEM_FILE" setup-https.sh "$EC2_USER@$EC2_HOST:/home/$EC2_USER/"

# Execute the script on the server
echo "Executing setup script on server..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "chmod +x /home/$EC2_USER/setup-https.sh && sudo /home/$EC2_USER/setup-https.sh"

# Clean up the local script
rm -f setup-https.sh

echo "HTTPS setup process completed!" 