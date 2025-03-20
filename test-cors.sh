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

echo "Creating CORS test script..."
cat > test_cors.sh << 'EOF'
#!/bin/bash

echo "========== TESTING API AND CORS =========="

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "curl not found, installing..."
    sudo apt-get update
    sudo apt-get install -y curl
fi

# First check if the backend is running
echo "Checking if backend is running..."
curl -s http://localhost:8000/health > /dev/null
if [ $? -ne 0 ]; then
    echo "Backend is not running locally. Checking PM2 status..."
    pm2 list
    
    echo "Starting backend if needed..."
    cd /var/www/dsphoto-backend
    pm2 start server.js --name dsphoto-api || pm2 restart dsphoto-api
    
    echo "Waiting for backend to start..."
    sleep 3
    
    curl -s http://localhost:8000/health > /dev/null
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to start backend. Check logs for more details."
        pm2 logs --lines 20
        exit 1
    fi
fi

echo ""
echo "Testing HTTP endpoint directly (should succeed):"
curl -v http://localhost:8000/health

echo ""
echo "Testing HTTP endpoint through Nginx (should succeed):"
curl -v http://api.fotods.no/health

echo ""
echo "Testing data endpoint directly (should return JSON):"
curl -v http://localhost:8000/images

echo ""
echo "Testing data endpoint through Nginx (should return JSON):"
curl -v http://api.fotods.no/images

echo ""
echo "Testing CORS preflight directly (from fotods.no origin):"
curl -v -H "Origin: https://fotods.no" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8000/images

echo ""
echo "Testing CORS preflight through Nginx (from fotods.no origin):"
curl -v -H "Origin: https://fotods.no" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://api.fotods.no/images

echo ""
echo "Testing CORS GET request directly (from fotods.no origin):"
curl -v -H "Origin: https://fotods.no" http://localhost:8000/images

echo ""
echo "Testing CORS GET request through Nginx (from fotods.no origin):"
curl -v -H "Origin: https://fotods.no" http://api.fotods.no/images

echo ""
echo "========== TESTING COMPLETED =========="

# Check Nginx status and logs
echo "Nginx status:"
sudo systemctl status nginx | head -n 20

echo ""
echo "Recent Nginx error logs:"
sudo tail -n 20 /var/log/nginx/error.log

echo ""
echo "Recent Nginx access logs:"
sudo tail -n 20 /var/log/nginx/access.log

echo ""
echo "CORS testing completed."
EOF

echo "Uploading and executing CORS test script..."
chmod +x test_cors.sh
scp -i $PEM_FILE test_cors.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/test_cors.sh && sudo /home/$EC2_USER/test_cors.sh"

# Clean up
rm -f test_cors.sh
echo "CORS testing completed." 