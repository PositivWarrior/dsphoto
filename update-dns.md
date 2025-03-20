# DNS and Connectivity Issues - Resolution Plan

Based on our diagnostics, we're seeing several issues that need to be addressed:

1. We're unable to connect to the server on port 80 or 443 from the outside
2. The Node.js application is having trouble binding to port 8000
3. The Nginx configuration needs to be simplified

## Recommended Actions

### 1. Check DNS Configuration

The DNS for api.fotods.no is configured to point to 51.21.110.161, but we're unable to connect. This could be due to:

-   DNS propagation delays
-   Firewall/security group issues
-   The server isn't listening on ports 80/443

**Solution:**

-   Verify in your DNS provider (likely Route 53 or similar) that api.fotods.no points to 51.21.110.161
-   Ensure that the DNS TTL is low (e.g., 300 seconds) to allow for faster propagation
-   Consider temporarily using direct IP access for testing: http://51.21.110.161

### 2. Check EC2 Security Group

The EC2 instance needs to have ports 80 and 443 open in its security group.

**Solution:**

-   Log into the AWS Console
-   Go to EC2 → Security Groups
-   Select the security group associated with the instance
-   Ensure inbound rules allow TCP traffic on ports 80 and 443 from anywhere (0.0.0.0/0)

### 3. Simplify the Backend Setup

**Solution:**

-   SSH into the EC2 instance
-   Create a minimal Node.js application that listens on port 3000 (avoiding potential conflicts)
-   Configure Nginx to proxy requests from port 80 to the application on port 3000
-   Test connectivity locally and then from the outside

Here's a minimal setup to implement:

```bash
# SSH into the instance
ssh -i fotods-kp.pem ubuntu@51.21.110.161

# Create a minimal backend
mkdir -p /var/www/simple-api
cd /var/www/simple-api

# Create a simple Express app
cat > server.js << 'END'
const express = require('express');
const app = express();
const PORT = 3000;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://fotods.no');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Simple endpoints
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/images', (req, res) => {
  const data = [
    { id: 1, title: 'Sample Image 1', url: 'https://example.com/image1.jpg' },
    { id: 2, title: 'Sample Image 2', url: 'https://example.com/image2.jpg' }
  ];
  res.json(data);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
END

# Install dependencies
npm init -y
npm install express

# Setup Nginx
sudo bash -c 'cat > /etc/nginx/sites-available/simple-api << END
server {
    listen 80;
    server_name api.fotods.no;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
END'

# Enable the config
sudo ln -sf /etc/nginx/sites-available/simple-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start the application
node server.js &
```

### 4. Test Connectivity

After implementing the above, test connectivity:

1. From the EC2 instance itself:

    ```
    curl http://localhost:3000/health
    curl http://localhost/health
    ```

2. From your local machine:

    ```
    curl http://api.fotods.no/health
    curl http://51.21.110.161/health
    ```

3. Using the browser simulation:
    - Open the browser-test.html file
    - Update the endpoints to use http://api.fotods.no
    - Test the API connections

## Additional Considerations

If you're still having issues after implementing these steps:

1. **Check for Network ACLs**: If your EC2 instance is in a VPC, ensure the Network ACLs allow traffic on ports 80 and 443.

2. **Consider using HTTPS**: Once HTTP is working, you can set up HTTPS using Let's Encrypt.

3. **PM2 for Production**: For a production setup, use PM2 to manage the Node.js application:
    ```
    npm install -g pm2
    pm2 start server.js --name simple-api
    pm2 save
    pm2 startup
    ```

## Next Steps

After resolving the connectivity issues, you can enhance the API with more features and improve security by adding HTTPS support.
