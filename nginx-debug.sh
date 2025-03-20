#!/bin/bash

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "ERROR: PEM file not found. Checking parent directory..."
    PEM_FILE="../$PEM_FILE"
    if [ ! -f "$PEM_FILE" ]; then
        echo "ERROR: PEM file not found in parent directory either. Please provide the correct path."
        exit 1
    fi
fi

echo "Creating Nginx debug script..."
cat > nginx_debug.sh << 'EOF'
#!/bin/bash

echo "=== Checking Nginx and Connectivity ==="

# Check Nginx error logs
echo "Checking Nginx error logs..."
sudo tail -n 50 /var/log/nginx/error.log

# Check Nginx access logs
echo ""
echo "Checking Nginx access logs..."
sudo tail -n 50 /var/log/nginx/access.log

# Check if sites-enabled has the proper symlink
echo ""
echo "Checking Nginx sites-enabled symlink..."
ls -la /etc/nginx/sites-enabled/
if [ ! -L "/etc/nginx/sites-enabled/dsphoto-backend" ]; then
  echo "Creating symlink for dsphoto-backend..."
  sudo ln -sf /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-enabled/
fi

# Check for duplicate entries
echo ""
echo "Checking for duplicate server entries..."
sudo grep -r "server_name api.fotods.no" /etc/nginx/sites-enabled/

# Enhance debugging in Nginx config
echo ""
echo "Enhancing Nginx debug settings..."
sudo bash -c 'cat > /etc/nginx/conf.d/debug.conf << DEBUG_CONF
error_log /var/log/nginx/error.log debug;
DEBUG_CONF'

# Fix potential permission issues
echo ""
echo "Checking backend directory permissions..."
sudo chown -R www-data:www-data /var/www/dsphoto-backend
ls -la /var/www/dsphoto-backend

# Check active listeners
echo ""
echo "Checking active listeners on port 8000..."
sudo netstat -tulpn | grep :8000

# Test connection directly to Express
echo ""
echo "Testing connection directly to Express..."
curl -v http://localhost:8000/health

# Check if firewall might be blocking
echo ""
echo "Checking firewall status..."
sudo ufw status

# Test Nginx directly with minimal config
echo ""
echo "Creating minimal Nginx config for testing..."
sudo bash -c 'cat > /etc/nginx/sites-available/dsphoto-test << TEST_CONF
server {
    listen 80;
    server_name api.fotods.no;
    
    location / {
        proxy_pass http://localhost:8000;
    }
}
TEST_CONF'

sudo ln -sf /etc/nginx/sites-available/dsphoto-test /etc/nginx/sites-enabled/dsphoto-test
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Restarting Nginx with minimal config..."
    sudo systemctl restart nginx
else
    echo "Minimal config test failed, checking for other issues..."
fi

# Check SELinux (if applicable)
if command -v getenforce &> /dev/null; then
    echo ""
    echo "Checking SELinux status..."
    getenforce
fi

# Restart both services
echo ""
echo "Restarting services..."
cd /var/www/dsphoto-backend
pm2 restart dsphoto-backend
sudo systemctl restart nginx

# Final test
echo ""
echo "Final test through Nginx..."
curl -v http://api.fotods.no/health
curl -v https://api.fotods.no/health

echo ""
echo "Nginx debugging completed."
EOF

echo "Uploading and executing Nginx debug script..."
chmod +x nginx_debug.sh
scp -i $PEM_FILE nginx_debug.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/nginx_debug.sh && sudo /home/$EC2_USER/nginx_debug.sh"

# Clean up
rm -f nginx_debug.sh
echo "Nginx debugging completed." 