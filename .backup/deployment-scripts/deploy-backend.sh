#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 instance details
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

echo -e "${YELLOW}Starting complete backend deployment...${NC}"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Create an optimized version of the server.js file
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: 'https://fotods.no',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Pre-flight handler for OPTIONS requests
app.options('*', cors(corsOptions));

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'DS PHOTO API is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create sample data file if it doesn't exist
const sampleDataFile = path.join(dataDir, 'images.json');
if (!fs.existsSync(sampleDataFile)) {
  const sampleData = [
    {
      id: 1,
      title: 'Sample Image 1',
      description: 'This is a sample image description',
      url: 'https://api.fotods.no/assets/sample1.jpg',
      thumbnail: 'https://api.fotods.no/assets/sample1_thumb.jpg',
      category: 'portraits'
    },
    {
      id: 2,
      title: 'Sample Image 2',
      description: 'Another sample image description',
      url: 'https://api.fotods.no/assets/sample2.jpg',
      thumbnail: 'https://api.fotods.no/assets/sample2_thumb.jpg',
      category: 'landscapes'
    }
  ];
  fs.writeFileSync(sampleDataFile, JSON.stringify(sampleData, null, 2));
}

// Get all images
app.get('/images', (req, res) => {
  try {
    const data = fs.readFileSync(sampleDataFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading images data:', error);
    res.status(500).json({ error: 'Failed to load images' });
  }
});

// Create assets directory for sample images
const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "dsphoto-backend",
  "version": "1.0.0",
  "description": "DS Photo backend API",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "fs": "0.0.1-security",
    "path": "^0.12.7"
  }
}
EOF

# Create Nginx configuration
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name api.fotods.no;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.fotods.no;
    
    # Increase client body size limit for large uploads
    client_max_body_size 50M;
    
    ssl_certificate /etc/letsencrypt/live/api.fotods.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fotods.no/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Let the Express app handle CORS, don't set headers here
    }
    
    location /assets/ {
        alias /var/www/dsphoto-backend/public/assets/;
        try_files $uri $uri/ =404;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Create a deployment script to run on the server
cat > remote-deploy.sh << 'EOF'
#!/bin/bash

# Set up paths
BACKEND_DIR="/var/www/dsphoto-backend"
TEMP_DIR="/home/ubuntu/dsphoto-temp"

# Create temp directory
mkdir -p $TEMP_DIR

# Move uploaded files to temp directory
cp -r /home/ubuntu/upload/* $TEMP_DIR/

# Create backup of existing backend
echo "Creating backup of existing backend..."
BACKUP_DIR="${BACKEND_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
sudo mkdir -p $BACKUP_DIR
sudo cp -r $BACKEND_DIR/* $BACKUP_DIR/ 2>/dev/null || echo "No files to backup"

# Clean and prepare backend directory
echo "Preparing backend directory..."
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $BACKEND_DIR/public/assets
sudo mkdir -p $BACKEND_DIR/data

# Install dependencies
echo "Installing dependencies..."
cd $TEMP_DIR
npm install --silent

# Copy files to backend directory
echo "Copying files to backend directory..."
sudo cp -r $TEMP_DIR/* $BACKEND_DIR/
sudo chown -R ubuntu:ubuntu $BACKEND_DIR

# Set up Nginx
echo "Setting up Nginx..."
sudo cp $TEMP_DIR/nginx.conf /etc/nginx/sites-available/dsphoto-backend
sudo ln -sf /etc/nginx/sites-available/dsphoto-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/simple-api # Remove conflicting config
sudo nginx -t && sudo systemctl reload nginx

# Restart the application with PM2
echo "Restarting application..."
cd $BACKEND_DIR
pm2 delete dsphoto-backend 2>/dev/null || echo "No process to delete"
pm2 start server.js --name dsphoto-backend
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Clean up temp directory
echo "Cleaning up..."
rm -rf $TEMP_DIR

# Test the API
echo "Testing API..."
curl -s http://localhost:3000/health

echo "Deployment completed!"
EOF

# Create a directory for files to upload
UPLOAD_DIR="upload"
mkdir -p $UPLOAD_DIR

# Copy files to upload directory
cp server.js $UPLOAD_DIR/
cp package.json $UPLOAD_DIR/
cp nginx.conf $UPLOAD_DIR/
cp remote-deploy.sh $UPLOAD_DIR/

# Upload files to the server
echo -e "${YELLOW}Uploading files to server...${NC}"
scp -i $PEM_FILE -r $UPLOAD_DIR/* $EC2_USER@$EC2_HOST:/home/$EC2_USER/upload/
scp -i $PEM_FILE remote-deploy.sh $EC2_USER@$EC2_HOST:/home/$EC2_USER/

# Execute deployment script on server
echo -e "${YELLOW}Executing deployment script on server...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "chmod +x /home/$EC2_USER/remote-deploy.sh && /home/$EC2_USER/remote-deploy.sh"

# Clean up local files
echo -e "${YELLOW}Cleaning up local files...${NC}"
rm -rf server.js package.json nginx.conf remote-deploy.sh $UPLOAD_DIR

echo -e "${GREEN}Backend deployment completed successfully!${NC}"
echo -e "${YELLOW}You can access the API at:${NC} https://api.fotods.no"
echo -e "${YELLOW}Test the API with:${NC} curl -v https://api.fotods.no/health" 