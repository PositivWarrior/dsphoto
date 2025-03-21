#!/bin/bash

# Set up variables
EC2_USER="ubuntu"
EC2_HOST="51.21.110.161"
PEM_FILE="fotods-kp.pem"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "Error: PEM file not found at $PEM_FILE"
    exit 1
fi

# Create the script to run on the server
cat > restart-api.sh << 'EOF'
#!/bin/bash

echo "Creating a new API server file with HTTPS support..."
sudo tee /var/www/dsphoto-backend/server.js > /dev/null << 'EOT'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: 'https://fotods.no',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

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
      url: 'https://api.fotods.no/assets/Dawid_hero.jpg',
      thumbnail: 'https://api.fotods.no/assets/Dawid_hero.jpg',
      category: 'portraits'
    },
    {
      id: 2,
      title: 'Sample Image 2',
      description: 'Another sample image description',
      url: 'https://api.fotods.no/assets/landscape1.jpg',
      thumbnail: 'https://api.fotods.no/assets/landscape1.jpg',
      category: 'landscapes'
    }
  ];
  fs.writeFileSync(sampleDataFile, JSON.stringify(sampleData, null, 2));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

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
EOT

echo "Setting up public directory for assets..."
sudo mkdir -p /var/www/dsphoto-backend/public/assets

echo "Restart PM2 process..."
cd /var/www/dsphoto-backend
pm2 delete dsphoto-backend || true
pm2 start server.js --name dsphoto-backend
pm2 save

echo "API server restarted with HTTPS support!"
EOF

# Upload the script to the server
echo "Uploading restart script to server..."
scp -i "$PEM_FILE" restart-api.sh "$EC2_USER@$EC2_HOST:/home/$EC2_USER/"

# Execute the script on the server
echo "Executing restart script on server..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "chmod +x /home/$EC2_USER/restart-api.sh && /home/$EC2_USER/restart-api.sh"

# Clean up the local script
rm -f restart-api.sh

echo "API restart process completed!" 