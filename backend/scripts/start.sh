#!/bin/bash

# Navigate to the application directory
cd "${PWD}"

# Install dependencies if needed
npm install

# Start the application
NODE_ENV=production exec node server.js 