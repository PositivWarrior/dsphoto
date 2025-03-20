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

# Create the script to fix MongoDB issues
cat > fix-mongodb.js << 'EOF'
// Modified db.js for better MongoDB connection

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('MongoDB connection failed. Will retry...');
    return null;
  }
};

export default connectDB;
EOF

# Upload the fix to the server
echo -e "${YELLOW}Uploading MongoDB fix to server...${NC}"
scp -i $PEM_FILE fix-mongodb.js $EC2_USER@$EC2_HOST:/home/$EC2_USER/fix-mongodb.js

# SSH to the server and apply the fix
echo -e "${YELLOW}Applying MongoDB connection fix...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "
    # Replace the db.js file
    sudo cp /home/$EC2_USER/fix-mongodb.js /var/www/dsphoto-backend/config/db.js
    
    # Restart the application
    cd /var/www/dsphoto-backend
    pm2 restart dsphoto-backend
    
    # Show logs
    echo 'Checking logs:'
    sleep 3
    pm2 logs dsphoto-backend --lines 10 --nostream
"

# Clean up
rm -f fix-mongodb.js

echo -e "${GREEN}MongoDB connection fix has been applied!${NC}"
echo -e "${YELLOW}Testing the API now...${NC}" 