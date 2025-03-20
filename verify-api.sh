#!/bin/bash

echo "Verifying API connectivity..."

echo "1. Testing API health endpoint:"
curl -s http://api.fotods.no/health
echo ""

echo "2. Testing API images endpoint:"
curl -s http://api.fotods.no/images
echo ""

echo "3. Testing with Origin header (CORS):"
curl -s -H "Origin: https://fotods.no" http://api.fotods.no/images
echo ""

echo "4. Testing with OPTIONS preflight request:"
curl -v -X OPTIONS -H "Origin: https://fotods.no" \
  -H "Access-Control-Request-Method: GET" \
  http://api.fotods.no/images
echo ""

echo "5. Creating a simple HTML page to test cross-origin requests from browser:"
cat > cors-test.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>CORS Test for api.fotods.no</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        button { padding: 10px; margin: 5px; cursor: pointer; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>CORS Test for api.fotods.no</h1>
    
    <div>
        <button id="testGet">Test GET /health</button>
        <button id="testImages">Test GET /images</button>
        <button id="testFetch">Test Fetch API</button>
    </div>
    
    <h3>Results:</h3>
    <pre id="results">Click a button to test...</pre>
    
    <script>
        const resultsEl = document.getElementById('results');
        
        function addResult(text, isSuccess = true) {
            const className = isSuccess ? 'success' : 'error';
            resultsEl.innerHTML += `<div class="${className}">${new Date().toISOString()}: ${text}</div>`;
        }
        
        document.getElementById('testGet').addEventListener('click', function() {
            resultsEl.innerHTML = '';
            addResult('Testing GET /health...');
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://api.fotods.no/health');
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    addResult(`Success! Response: ${xhr.responseText}`);
                } else {
                    addResult(`Failed with status: ${xhr.status}`, false);
                }
            };
            
            xhr.onerror = function() {
                addResult('Request failed, likely due to CORS issues', false);
                addResult('Check browser console for more details', false);
            };
            
            xhr.send();
        });
        
        document.getElementById('testImages').addEventListener('click', function() {
            resultsEl.innerHTML = '';
            addResult('Testing GET /images...');
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://api.fotods.no/images');
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    addResult(`Success! Response: ${xhr.responseText}`);
                } else {
                    addResult(`Failed with status: ${xhr.status}`, false);
                }
            };
            
            xhr.onerror = function() {
                addResult('Request failed, likely due to CORS issues', false);
                addResult('Check browser console for more details', false);
            };
            
            xhr.send();
        });
        
        document.getElementById('testFetch').addEventListener('click', function() {
            resultsEl.innerHTML = '';
            addResult('Testing Fetch API...');
            
            fetch('http://api.fotods.no/images')
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error(`Status: ${response.status}`);
                })
                .then(data => {
                    addResult(`Success! Received ${data.length} items`);
                    addResult(`Data: ${JSON.stringify(data)}`);
                })
                .catch(error => {
                    addResult(`Error: ${error.message}`, false);
                    addResult('Check browser console for more details', false);
                });
        });
    </script>
</body>
</html>
HTML

echo "CORS test HTML page created. Open cors-test.html in your browser to test cross-origin requests."
echo "API verification completed." 