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

echo "Creating fix script..."
cat > fix_backend.sh << 'EOF'
#!/bin/bash

# Disable any conflicting configurations
echo "Disabling conflicting configurations..."
cd /etc/nginx/sites-enabled
sudo rm -f dsphoto-backend dsphoto-test

# Create a clean configuration
echo "Creating clean Nginx configuration..."
sudo bash -c 'cat > /etc/nginx/sites-available/dsphoto-api << EOL
server {
    listen 80;
    listen [::]:80;
    server_name api.fotods.no;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name api.fotods.no;

    ssl_certificate /etc/letsencrypt/live/fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fotods.no/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        # Basic proxy settings
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header "Access-Control-Expose-Headers" "Content-Length,Content-Range" always;
        add_header "Access-Control-Allow-Credentials" "true" always;

        # Handle OPTIONS requests
        if ($request_method = "OPTIONS") {
            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
            add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
            add_header "Access-Control-Expose-Headers" "Content-Length,Content-Range" always;
            add_header "Access-Control-Allow-Credentials" "true" always;
            add_header "Content-Type" "text/plain charset=UTF-8";
            add_header "Content-Length" "0";
            return 204;
        }
    }
}
EOL'

# Enable the new configuration
echo "Enabling new configuration..."
sudo ln -sf /etc/nginx/sites-available/dsphoto-api /etc/nginx/sites-enabled/

# Validate and restart Nginx
echo "Testing Nginx configuration..."
sudo nginx -t

# Modify the backend to log more information
echo "Updating backend to include better logging..."
cat > /var/www/dsphoto-backend/server.js << 'SERVER_JS'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Configure CORS
const corsOptions = {
  origin: 'https://fotods.no',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'unknown'}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).send('OK');
});

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create sample data file if it doesn't exist
const imagesJsonPath = path.join(dataDir, 'images.json');
if (!fs.existsSync(imagesJsonPath)) {
  const sampleData = [
    { id: 1, title: 'Sample Image 1', url: 'https://example.com/image1.jpg' },
    { id: 2, title: 'Sample Image 2', url: 'https://example.com/image2.jpg' },
  ];
  fs.writeFileSync(imagesJsonPath, JSON.stringify(sampleData, null, 2));
}

// Images data endpoint
app.get('/images', (req, res) => {
  console.log('Images requested');
  try {
    const imagesData = fs.readFileSync(imagesJsonPath, 'utf8');
    res.json(JSON.parse(imagesData));
  } catch (error) {
    console.error('Error reading image data:', error);
    res.status(500).json({ error: 'Failed to read image data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
SERVER_JS

# Make sure permissions are correct
sudo chown -R www-data:www-data /var/www/dsphoto-backend

# Restart services
echo "Restarting services..."
cd /var/www/dsphoto-backend
pm2 restart dsphoto-backend
sudo systemctl restart nginx

# Test the setup
echo "Testing API access..."
echo "Direct connection test:"
curl -v http://localhost:8000/health
echo ""
echo "Through Nginx HTTP test:"
curl -v http://api.fotods.no/health
echo ""
echo "Through Nginx HTTPS test:"
curl -v https://api.fotods.no/health

echo "Fix applied. Please check the tests above to verify."
EOF

echo "Uploading and executing fix script..."
chmod +x fix_backend.sh
scp -i $PEM_FILE fix_backend.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/fix_backend.sh && sudo /home/$EC2_USER/fix_backend.sh"

# Clean up
rm -f fix_backend.sh
echo "Backend fix completed." 