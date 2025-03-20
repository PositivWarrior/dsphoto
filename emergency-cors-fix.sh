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

echo "Creating emergency CORS fix..."
cat > emergency_fix.sh << 'EOF'
#!/bin/bash

echo "Checking existing proxy configuration..."
CONFIG_FILE="/etc/nginx/sites-available/default"

if [ ! -f "/etc/nginx/sites-available/dsphoto-backend" ]; then
    echo "dsphoto-backend configuration not found, checking default..."
    CONFIG_FILE="/etc/nginx/sites-available/default"
else
    CONFIG_FILE="/etc/nginx/sites-available/dsphoto-backend"
    echo "Using dsphoto-backend configuration"
fi

echo "Creating new Nginx configuration with CORS headers..."

sudo tee /tmp/cors-nginx.conf << 'END'
server {
    listen 80;
    server_name api.fotods.no;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.fotods.no;
    
    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    
    client_max_body_size 50M;
    
    # Direct handling of OPTIONS preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '1728000' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' '0';
        return 204;
    }
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://fotods.no' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
}
END

echo "Backing up existing configuration..."
sudo cp "$CONFIG_FILE" "$CONFIG_FILE.bak.$(date +%Y%m%d%H%M%S)"

echo "Applying new configuration..."
sudo cp /tmp/cors-nginx.conf "$CONFIG_FILE"

echo "Checking Express CORS configuration..."
cd /var/www/dsphoto-backend
cat > cors-express-fix.js << 'JSFIX'
// Simple CORS configuration in CommonJS format
const fs = require('fs');
const server_js = fs.readFileSync('server.js', 'utf8');

// Prepare CORS configuration
const corsConfig = `
// CORS configuration
import cors from 'cors';
const corsOptions = {
  origin: 'https://fotods.no',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
`;

// Check if CORS is already configured properly
if (server_js.includes("origin: 'https://fotods.no'")) {
  console.log('CORS already configured correctly');
} else {
  // If CORS is used but not configured correctly
  if (server_js.includes('app.use(cors(')) {
    const modified = server_js.replace(/app\.use\(cors\([^)]*\)\);/, corsConfig);
    fs.writeFileSync('server.js', modified);
    console.log('Updated CORS configuration in server.js');
  } else {
    // If CORS is not used at all
    const lines = server_js.split('\n');
    let appIndex = -1;
    
    // Find where the app is created
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('const app = express()')) {
        appIndex = i;
        break;
      }
    }
    
    if (appIndex !== -1) {
      lines.splice(appIndex + 1, 0, corsConfig);
      fs.writeFileSync('server.js', lines.join('\n'));
      console.log('Added CORS configuration after app creation');
    } else {
      console.log('Could not find app creation, manual intervention needed');
    }
  }
}
JSFIX

echo "Applying Express CORS fix..."
sudo node cors-express-fix.js

echo "Testing and restarting services..."
sudo nginx -t && sudo systemctl restart nginx
pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend

echo "Verifying headers with curl..."
curl -I -H "Origin: https://fotods.no" -X OPTIONS https://api.fotods.no/images

echo "Emergency fix applied!"
EOF

echo "Uploading and executing emergency fix..."
chmod +x emergency_fix.sh
scp -i $PEM_FILE emergency_fix.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/emergency_fix.sh && sudo /home/$EC2_USER/emergency_fix.sh"

# Clean up
rm -f emergency_fix.sh
echo "Emergency CORS fix completed."
EOF 