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

echo "Creating network diagnostic script..."
cat > network_diagnostic.sh << 'EOF'
#!/bin/bash

echo "========== NETWORK DIAGNOSTICS =========="

# Check system hostname and IP
echo "System info:"
hostname
hostname -I
echo ""

# Check active interfaces
echo "Network interfaces:"
ip addr
echo ""

# Check listening ports
echo "Listening ports:"
sudo netstat -tulpn | grep LISTEN
echo ""

# Test local server
echo "Testing localhost connectivity:"
curl -v http://localhost:8000/health
echo ""

# Check PM2 processes
echo "PM2 processes:"
pm2 list
echo ""

# Check if Express server is actually listening
echo "Checking for processes listening on port 8000:"
sudo lsof -i :8000
echo ""

# Try to restart the Express server with explicit binding
echo "Restarting Express server with explicit binding to 0.0.0.0..."
cd /var/www/dsphoto-backend
cat > bind_test.js << 'BIND_JS'
const express = require('express');
const app = express();

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Log all requests
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Hard-code listening to all interfaces
const server = app.listen(8000, '0.0.0.0', () => {
  console.log('Server explicitly listening on 0.0.0.0:8000');
});
BIND_JS

# Stop existing processes and start new one
pm2 stop all
pm2 start bind_test.js --name bind-test

# Wait for server to start
sleep 3

# Check if it's listening
echo "Checking if bind test is listening:"
sudo lsof -i :8000
echo ""

# Test connectivity to the new server
echo "Testing connectivity to bind test server:"
curl -v http://localhost:8000/health
echo ""

# Check firewall status
echo "Firewall status:"
sudo ufw status
echo ""

# Check security groups (if AWS)
echo "Checking AWS security groups:"
if command -v aws &> /dev/null; then
    echo "AWS CLI found, checking security groups..."
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    aws ec2 describe-instance-attribute --instance-id $INSTANCE_ID --attribute groupSet
else
    echo "AWS CLI not installed, skipping security group check"
fi
echo ""

# Check if port 80 and 443 are reachable from outside
echo "Checking if ports 80 and 443 are publicly accessible..."
echo "This requires netcat (nc) to be installed on both ends"
echo "Please run the following command from your local machine to test port 80:"
echo "nc -vz 51.21.110.161 80"
echo "And this command to test port 443:"
echo "nc -vz 51.21.110.161 443"
echo ""

# Test DNS resolution
echo "Testing DNS resolution for api.fotods.no:"
nslookup api.fotods.no
echo ""

# Check for duplicate listening services
echo "Checking for duplicate services on port 80/443:"
sudo netstat -tulpn | grep ':80\|:443'
echo ""

# Check Nginx logs
echo "Recent Nginx error logs:"
sudo tail -n 20 /var/log/nginx/error.log
echo ""

echo "Recent Nginx access logs:"
sudo tail -n 20 /var/log/nginx/access.log
echo ""

# Test connections to the Node.js server from Nginx
echo "Testing connections from Nginx to Node.js server:"
sudo -u www-data curl -v http://localhost:8000/health
echo ""

echo "========== DIAGNOSTICS COMPLETE =========="
EOF

echo "Uploading and executing network diagnostic script..."
chmod +x network_diagnostic.sh
scp -i $PEM_FILE network_diagnostic.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/network_diagnostic.sh && sudo /home/$EC2_USER/network_diagnostic.sh"

# Clean up
rm -f network_diagnostic.sh
echo "Network diagnostics completed." 