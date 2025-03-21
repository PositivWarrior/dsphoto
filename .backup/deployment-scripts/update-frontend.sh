#!/bin/bash

echo "Checking for the API configuration in the frontend..."

# Search for API configuration file
API_CONFIG_FILES=$(grep -r "api\.fotods\.no" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .)

if [ -z "$API_CONFIG_FILES" ]; then
    echo "No API configuration found in the frontend."
    echo "Please check your frontend code and make sure you're using https://api.fotods.no for API requests."
    echo ""
    echo "If you're using environment variables, check your .env file or environment configuration."
    echo ""
    echo "Example code for your API client:"
    echo ""
    cat << 'EOF'
// API client configuration
const apiClient = axios.create({
  baseURL: 'https://api.fotods.no',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
EOF
    exit 0
fi

echo "Found potential API configuration in these files:"
echo "$API_CONFIG_FILES"
echo ""
echo "Please check these files and ensure they're using https://api.fotods.no for API requests."
echo ""
echo "To update all http:// URLs to https://, run the following command:"
echo "grep -r -l \"http://api\.fotods\.no\" --include=\"*.js\" --include=\"*.jsx\" --include=\"*.ts\" --include=\"*.tsx\" . | xargs sed -i 's|http://api\.fotods\.no|https://api\.fotods\.no|g'"
echo ""
echo "The API server is now properly configured with HTTPS. Make sure your frontend uses https:// to connect to it."
echo "You can test the API at: https://51.21.110.161/browser-test.html" 