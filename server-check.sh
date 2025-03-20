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

echo "Creating server diagnostic script..."
cat > server_diagnostic.sh << 'EOF'
#!/bin/bash

echo "=== PM2 Process Information ==="
pm2 info dsphoto-backend

echo ""
echo "=== PM2 Log Files ==="
ls -la ~/.pm2/logs/

echo ""
echo "=== Recent Application Logs ==="
tail -n 50 ~/.pm2/logs/dsphoto-backend-error.log
tail -n 50 ~/.pm2/logs/dsphoto-backend-out.log

echo ""
echo "=== Server.js File Content ==="
cat /var/www/dsphoto-backend/server.js

echo ""
echo "=== Node.js Version ==="
node --version

echo ""
echo "=== Nginx Error Logs ==="
sudo tail -n 50 /var/log/nginx/error.log

echo ""
echo "=== Testing Service Manually ==="
cd /var/www/dsphoto-backend
node -e "try { require('./server.js') } catch(e) { console.error('Server.js error:', e); }"
echo "Manual test completed"

echo ""
echo "=== Network Connections ==="
sudo netstat -tulpn | grep -E ':(80|443|8000)'

echo ""
echo "=== Restarting Express Application with Debug Mode ==="
cd /var/www/dsphoto-backend
pm2 stop dsphoto-backend
NODE_ENV=development DEBUG=* pm2 start server.js --name dsphoto-backend
sleep 5
pm2 logs dsphoto-backend --lines 20
EOF

echo "Uploading and executing server diagnostic script..."
chmod +x server_diagnostic.sh
scp -i $PEM_FILE server_diagnostic.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/server_diagnostic.sh && sudo /home/$EC2_USER/server_diagnostic.sh"

# Clean up
rm -f server_diagnostic.sh
echo "Server diagnostics completed." 