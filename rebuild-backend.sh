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

echo "Creating rebuild backend script..."
cat > rebuild_backend.sh << 'EOF'
#!/bin/bash

echo "=== Rebuilding Backend from Scratch ==="
cd ~

# Backup current backend
echo "Backing up current backend..."
sudo mv /var/www/dsphoto-backend /var/www/dsphoto-backend.backup.$(date +%Y%m%d%H%M%S)

# Create fresh directory
echo "Creating fresh backend directory..."
sudo mkdir -p /var/www/dsphoto-backend
sudo chown -R $USER:$USER /var/www/dsphoto-backend
cd /var/www/dsphoto-backend

# Initialize new Node.js project
echo "Initializing new Node.js project..."
npm init -y

# Install essential packages
echo "Installing essential packages..."
npm install express cors dotenv

# Create simple server.js
echo "Creating simple server.js..."
cat > server.js << 'SERVER_JS'
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8000;

// Basic configuration
app.use(express.json());
app.use(cors({
  origin: 'https://fotods.no',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Create data directory and sample data
const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Create sample data file if it doesn't exist
const imagesDataPath = path.join(dataPath, 'images.json');
if (!fs.existsSync(imagesDataPath)) {
  const sampleData = [
    { id: 1, title: 'Sample Image 1', url: 'https://example.com/image1.jpg' },
    { id: 2, title: 'Sample Image 2', url: 'https://example.com/image2.jpg' }
  ];
  fs.writeFileSync(imagesDataPath, JSON.stringify(sampleData, null, 2));
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the dsphoto API!' });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/images', (req, res) => {
  try {
    const data = fs.readFileSync(imagesDataPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading images data:', error);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
SERVER_JS

# Create package.json with type module
echo "Updating package.json..."
cat > package.json << 'PACKAGE_JSON'
{
  "name": "dsphoto-backend",
  "version": "1.0.0",
  "description": "Backend for dsphoto application",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "dotenv": "^16.3.1"
  }
}
PACKAGE_JSON

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup PM2
echo "Setting up PM2..."
npm install -g pm2

# Start the application with PM2
echo "Starting application with PM2..."
pm2 stop dsphoto-backend || true
pm2 delete dsphoto-backend || true
pm2 start server.js --name dsphoto-backend

# Save PM2 configuration
pm2 save

# Update Nginx configuration
echo "Updating Nginx configuration..."
sudo bash -c 'cat > /etc/nginx/sites-available/dsphoto-backend << NGINX_CONFIG
server {
    listen 80;
    server_name api.fotods.no;
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.fotods.no;
    
    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # CORS headers
        if (\$request_method = "OPTIONS") {
            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
            add_header "Access-Control-Allow-Headers" "Authorization, Origin, X-Requested-With, Content-Type, Accept" always;
            add_header "Access-Control-Allow-Credentials" "true" always;
            add_header "Access-Control-Max-Age" 86400;
            add_header "Content-Type" "text/plain charset=UTF-8";
            add_header "Content-Length" 0;
            return 204;
        }
        
        add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header "Access-Control-Allow-Headers" "Authorization, Origin, X-Requested-With, Content-Type, Accept" always;
        add_header "Access-Control-Allow-Credentials" "true" always;
    }
}
NGINX_CONFIG'

# Check Nginx configuration
echo "Checking Nginx configuration..."
sudo nginx -t

# Restart Nginx if configuration is valid
if [ $? -eq 0 ]; then
    echo "Restarting Nginx..."
    sudo systemctl restart nginx
else
    echo "ERROR: Nginx configuration is invalid. Please check the configuration."
fi

# Test local server
echo "Testing local server..."
curl -s http://localhost:8000/health
echo ""
curl -s http://localhost:8000/images

# Test through Nginx with CORS headers
echo ""
echo "Testing through Nginx with CORS headers..."
curl -s -I -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: GET" -X OPTIONS https://api.fotods.no/images
echo ""
curl -s -H "Origin: https://fotods.no" https://api.fotods.no/images

echo ""
echo "Backend rebuild completed!"
EOF

echo "Uploading and executing rebuild backend script..."
chmod +x rebuild_backend.sh
scp -i $PEM_FILE rebuild_backend.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/rebuild_backend.sh && sudo /home/$EC2_USER/rebuild_backend.sh"

# Clean up
rm -f rebuild_backend.sh
echo "Backend rebuild initiated. This process might take several minutes to complete." 