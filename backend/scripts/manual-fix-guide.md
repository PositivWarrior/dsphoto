# Manual Fix Guide for Nginx Configuration

Follow these steps to manually fix the Nginx configuration on your server:

1. SSH into your server:

    ```bash
    ssh -i fotods-kp.pem ubuntu@51.21.110.161
    ```

2. View the current Nginx main configuration:

    ```bash
    sudo nano /etc/nginx/nginx.conf
    ```

3. Find the `http {` block and add the client_max_body_size directive inside it (not at the top of the file). It should look like this:

    ```
    http {
        client_max_body_size 50M;  # Add this line

        # rest of existing configuration...
    }
    ```

    Save and exit (Ctrl+O, Enter, Ctrl+X).

4. Now edit the site configuration:

    ```bash
    sudo nano /etc/nginx/sites-available/dsphoto-backend
    ```

5. Replace the entire content with this configuration:

    ```
    server {
        listen 80;
        server_name api.fotods.no;
        root /var/www/html;

        location ^~ /.well-known/acme-challenge/ {
            root /var/www/html;
            try_files $uri =404;
            allow all;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name api.fotods.no;

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
            proxy_pass http://127.0.0.1:8000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
            add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
            add_header "Access-Control-Allow-Credentials" "true" always;
            add_header "Access-Control-Max-Age" "1728000" always;

            if ($request_method = 'OPTIONS') {
                add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
                add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE" always;
                add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
                add_header "Access-Control-Allow-Credentials" "true" always;
                add_header "Access-Control-Max-Age" "1728000" always;
                add_header "Content-Type" "text/plain charset=UTF-8";
                add_header "Content-Length" "0";
                return 204;
            }
        }

        location /assets/ {
            alias /var/www/dsphoto-backend/assets/;
            try_files $uri $uri/ =404;
            expires 30d;
            add_header Cache-Control "public, no-transform";
            add_header "Access-Control-Allow-Origin" "https://fotods.no" always;
        }
    }
    ```

    Save and exit (Ctrl+O, Enter, Ctrl+X).

6. Test the configuration:

    ```bash
    sudo nginx -t
    ```

7. If the test is successful, restart Nginx:

    ```bash
    sudo systemctl restart nginx
    ```

8. Test if CORS is working:

    ```bash
    curl -I -H "Origin: https://fotods.no" https://api.fotods.no
    ```

    You should see `Access-Control-Allow-Origin: https://fotods.no` in the response.

9. Test an OPTIONS request:
    ```bash
    curl -v -X OPTIONS -H "Origin: https://fotods.no" -H "Access-Control-Request-Method: POST" https://api.fotods.no/images
    ```
    You should see the proper CORS headers in the response.

After completing these steps, refresh your admin page at https://fotods.no/admin and try uploading images again.

The key changes made:

1. Increase the maximum upload size to 50MB
2. Fix CORS headers to properly allow requests from fotods.no
3. Fix the OPTIONS request handling for preflight requests

If you still have issues, please try uploading a smaller image first to test if the CORS issue is resolved, then gradually try larger images to test the upload size limit.
