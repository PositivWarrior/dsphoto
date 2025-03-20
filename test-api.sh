#!/bin/bash

echo "Testing API from different contexts..."

echo "1. Direct HTTP test to API domain:"
curl -v http://api.fotods.no/health
echo ""

echo "2. Same test with Origin header (CORS):"
curl -v -H "Origin: https://fotods.no" http://api.fotods.no/health
echo ""

echo "3. Testing images endpoint:"
curl -v http://api.fotods.no/images
echo ""

echo "4. Testing OPTIONS preflight request:"
curl -v -X OPTIONS -H "Origin: https://fotods.no" \
  -H "Access-Control-Request-Method: GET" \
  http://api.fotods.no/images
echo ""

echo "5. Creating browser simulation HTML to test from browser context..."
cat > browser-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        div { margin-bottom: 10px; }
        button { padding: 10px; margin-right: 5px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>API Connectivity Test</h1>
    
    <div>
        <button onclick="testHealth()">Test Health Endpoint</button>
        <button onclick="testImages()">Test Images Endpoint</button>
        <button onclick="testFetch()">Test with Fetch API</button>
    </div>
    
    <pre id="results">Results will appear here...</pre>
    
    <script>
        const resultsEl = document.getElementById('results');
        
        function log(message, isError = false) {
            const className = isError ? 'error' : 'success';
            resultsEl.innerHTML += `<div class="${className}">${message}</div>`;
        }
        
        function testHealth() {
            resultsEl.innerHTML = 'Testing health endpoint...\n';
            
            fetch('http://api.fotods.no/health')
                .then(response => {
                    log(`Status: ${response.status} ${response.statusText}`);
                    return response.text();
                })
                .then(data => {
                    log(`Response: ${data}`);
                })
                .catch(error => {
                    log(`Error: ${error.message}`, true);
                });
        }
        
        function testImages() {
            resultsEl.innerHTML = 'Testing images endpoint...\n';
            
            fetch('http://api.fotods.no/images')
                .then(response => {
                    log(`Status: ${response.status} ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    log(`Received ${data.length} items`);
                    log(`Data: ${JSON.stringify(data, null, 2)}`);
                })
                .catch(error => {
                    log(`Error: ${error.message}`, true);
                });
        }
        
        function testFetch() {
            resultsEl.innerHTML = 'Testing with fetch + credentials...\n';
            
            fetch('http://api.fotods.no/images', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                log(`Status: ${response.status} ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                log(`Success! Data received.`);
            })
            .catch(error => {
                log(`Error: ${error.message}`, true);
            });
        }
    </script>
</body>
</html>
EOF

echo "Browser test file created: browser-test.html"
echo "Open this file in your web browser to test cross-origin API access"
echo ""

echo "All tests complete." 