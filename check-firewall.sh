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

echo "Creating firewall check script..."
cat > firewall_check.sh << 'EOF'
#!/bin/bash

echo "========== CHECKING FIREWALL AND CONNECTION ISSUES =========="

# Check if ports are listening
echo "Checking listening ports..."
sudo netstat -tulpn | grep 'LISTEN'
echo ""

# Check firewall settings
echo "Checking firewall settings..."
sudo ufw status
echo ""

# Check if Nginx is running
echo "Checking Nginx status..."
sudo systemctl status nginx
echo ""

# Create a simple netcat listener on port 8888 to test basic connectivity
echo "Setting up netcat listener on port 8888..."
sudo ufw allow 8888/tcp
nc -l -p 8888 > /dev/null &
NC_PID=$!
sleep 1

echo "Netcat listener started on port 8888. Test with: nc -vz 51.21.110.161 8888"
echo "Please try to connect to this port from your local machine."
echo ""

# Check security groups
echo "Checking AWS EC2 security groups (if available)..."
if command -v aws &> /dev/null; then
    echo "AWS CLI found, checking security groups..."
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    aws ec2 describe-instance-attribute --instance-id $INSTANCE_ID --attribute groupSet
else
    echo "AWS CLI not installed"
fi
echo ""

# Try to start a simple Python HTTP server on port 8899
echo "Starting a Python HTTP server on port 8899..."
sudo ufw allow 8899/tcp
cd /tmp
python3 -m http.server 8899 &
PYTHON_PID=$!
sleep 1

echo "Python HTTP server started on port 8899. Try accessing http://51.21.110.161:8899/"
echo ""

# Testing internal connectivity
echo "Testing internal connectivity (localhost)..."
curl -v http://localhost:80
echo ""
curl -v http://localhost:8080
echo ""
curl -v http://localhost:8000
echo ""

# Wait for the user to try connecting
echo "Waiting 60 seconds for you to test connectivity..."
sleep 60

# Clean up
echo "Cleaning up..."
kill $NC_PID
kill $PYTHON_PID
sudo ufw delete allow 8888/tcp
sudo ufw delete allow 8899/tcp

echo "========== FIREWALL CHECK COMPLETED =========="
EOF

echo "Uploading and executing firewall check script..."
chmod +x firewall_check.sh
scp -i $PEM_FILE firewall_check.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/firewall_check.sh && sudo /home/$EC2_USER/firewall_check.sh"

# Clean up
rm -f firewall_check.sh
echo "Firewall check completed." 