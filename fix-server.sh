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

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Create simplified server.js file
cat > simplified-server.js << 'EOF'
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
  credentials: true
};

app.use(cors(corsOptions));

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Create package.json file with CommonJS module system
cat > simplified-package.json << 'EOF'
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

# Upload the fix to the server
echo -e "${YELLOW}Uploading simplified server files to EC2...${NC}"
scp -i $PEM_FILE simplified-server.js $EC2_USER@$EC2_HOST:/home/$EC2_USER/server.js
scp -i $PEM_FILE simplified-package.json $EC2_USER@$EC2_HOST:/home/$EC2_USER/package.json

# SSH to the server and apply the fix
echo -e "${YELLOW}Applying server fix...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    # Back up existing files
    sudo mkdir -p /var/www/dsphoto-backend.bak
    sudo cp -r /var/www/dsphoto-backend/* /var/www/dsphoto-backend.bak/

    # Replace server.js and package.json
    sudo cp /home/$EC2_USER/server.js /var/www/dsphoto-backend/server.js
    sudo cp /home/$EC2_USER/package.json /var/www/dsphoto-backend/package.json
    
    # Install dependencies
    cd /var/www/dsphoto-backend
    sudo npm install --silent
    
    # Create data and assets directories
    sudo mkdir -p /var/www/dsphoto-backend/data
    sudo mkdir -p /var/www/dsphoto-backend/public/assets
    sudo chown -R $EC2_USER:$EC2_USER /var/www/dsphoto-backend
    
    # Restart the application
    pm2 restart dsphoto-backend || pm2 start server.js --name dsphoto-backend
    pm2 save
    
    # Test API locally
    echo 'Testing local API:'
    sleep 2
    curl -s http://localhost:3000 | grep message
    
    # Show logs
    echo 'Latest logs:'
    pm2 logs dsphoto-backend --lines 5 --nostream
"

# Clean up 
rm -f simplified-server.js simplified-package.json

echo -e "${GREEN}Server fix has been applied!${NC}"
echo -e "${YELLOW}Testing the API...${NC}"

# Test the API
curl -v https://api.fotods.no

echo -e "\n${YELLOW}Testing CORS...${NC}"
curl -v -H "Origin: https://fotods.no" https://api.fotods.no/images 