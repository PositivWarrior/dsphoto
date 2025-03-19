#!/bin/bash

# This script will apply the final fixes to the Nginx configuration
echo "Creating fix script..."

cat > simple-fix.sh << 'EOF'
#!/bin/bash

# Step 1: Backup old config first
echo "Backing up Nginx configuration..."
sudo cp /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-available/dsphoto-backend.backup

# Step 2: Create the client_max_body_size config - this is the key fix for the 413 error
echo "Creating upload size limit configuration..."
echo 'client_max_body_size 50M;' | sudo tee /etc/nginx/conf.d/upload_size.conf

# Step 3: Replace the CORS settings in the current config
echo "Updating CORS settings..."
sudo sed -i 's/if (\$http_origin ~ "\\^https:\\/\\/(www\\\\\\.)\\?fotods\\\\.no\$")/# CORS headers for all requests/' /etc/nginx/sites-available/dsphoto-backend
sudo sed -i 's/add_header "Access-Control-Allow-Origin" \$http_origin always;/add_header "Access-Control-Allow-Origin" "https:\/\/fotods.no" always;/' /etc/nginx/sites-available/dsphoto-backend

# Step 4: Test and restart
echo "Testing configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Restarting Nginx..."
    sudo systemctl restart nginx
    echo "Successfully fixed configuration!"
else
    echo "Configuration test failed, reverting changes..."
    sudo cp /etc/nginx/sites-available/dsphoto-backend.backup /etc/nginx/sites-available/dsphoto-backend
    sudo rm /etc/nginx/conf.d/upload_size.conf
    sudo nginx -t && sudo systemctl restart nginx
    exit 1
fi

# Verify CORS headers are working
echo "Verifying CORS headers..."
curl -I -H "Origin: https://fotods.no" https://api.fotods.no
EOF

# Make the script executable
chmod +x simple-fix.sh

echo "Uploading and running the fix script on the server..."
scp -i fotods-kp.pem simple-fix.sh ubuntu@51.21.110.161:/tmp/simple-fix.sh
ssh -i fotods-kp.pem ubuntu@51.21.110.161 "chmod +x /tmp/simple-fix.sh && sudo /tmp/simple-fix.sh"

# Clean up
rm simple-fix.sh

echo "Fix has been applied. Please refresh your admin page and try uploading images again." 