#!/bin/bash

echo "========== SYSTEM DIAGNOSTICS =========="

# Check system status
echo "System info:"
uname -a
echo ""

# Check memory usage
echo "Memory usage:"
free -h
echo ""

# Check disk space
echo "Disk space:"
df -h
echo ""

# Check active processes on port 8000
echo "Checking for processes listening on port 8000:"
sudo lsof -i :8000
sudo netstat -tulpn | grep 8000
echo ""

# Check Node.js installation
echo "Node.js version:"
node -v
echo ""

# Check PM2 status
echo "PM2 status:"
pm2 list
echo ""

# Create a test server that listens on all interfaces
echo "Creating test server..."
cat > /tmp/test-server.js << 'SERVER_JS'
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Received request:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is working!');
});

server.listen(8765, '0.0.0.0', () => {
  console.log('Test server listening on 0.0.0.0:8765');
});
SERVER_JS

# Run the test server
echo "Starting test server..."
node /tmp/test-server.js &
TEST_SERVER_PID=$!
sleep 3

# Test local connectivity
echo "Testing local connectivity to test server:"
curl -v http://localhost:8765
echo ""

# Create a dedicated server for our application
echo "Creating proper application server..."
cat > /var/www/dsphoto-backend/server.js << 'SERVER_JS'
const express = require('express');
const app = express();
const PORT = 8000;

// Debug logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Server error');
});

// Listen on all interfaces
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

// Handle server errors
server.on('error', (e) => {
  console.error('Server startup error:', e);
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free up the port and try again.`);
  }
});
SERVER_JS

# Stop any existing PM2 processes
echo "Stopping existing PM2 processes..."
pm2 stop all
pm2 delete all

# Start the server
echo "Starting application server..."
cd /var/www/dsphoto-backend
pm2 start server.js --name dsphoto-api

sleep 3

# Check if server is running
echo "Checking if server is running on port 8000:"
sudo lsof -i :8000
echo ""

# Test local connectivity
echo "Testing local connectivity to application server:"
curl -v http://localhost:8000/health
echo ""

# Check Nginx configuration
echo "Current Nginx configuration:"
sudo cat /etc/nginx/sites-enabled/dsphoto-api
echo ""

# Clean up test server
echo "Cleaning up test server..."
kill $TEST_SERVER_PID

echo "========== DIAGNOSTICS COMPLETE =========="
