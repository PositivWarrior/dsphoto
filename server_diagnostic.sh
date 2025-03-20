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
