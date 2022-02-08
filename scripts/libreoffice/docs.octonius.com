# HTTPS Server
server {
    listen 443 ssl;
    server_name docs.octonius.com;

    error_log /var/log/nginx/docs_error.log;

    # We use let's encrypt for SSL
    ssl_certificate /etc/letsencrypt/live/docs.octonius.com/fullchain.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/docs.octonius.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docs.octonius.com/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;

    # static files
    location ^~ /loleaflet {
        proxy_pass http://localhost:9980;
        proxy_set_header Host $http_host;
    }

    # WOPI discovery URL
    location ^~ /hosting/discovery {
        proxy_pass http://localhost:9980;
        proxy_set_header Host $http_host;
    }

    # Capabilities
    location ^~ /hosting/capabilities {
        proxy_pass http://localhost:9980;
        proxy_set_header Host $http_host;
    }

    # main websocket
    location ~ ^/lool/(.*)/ws$ {
        proxy_pass http://localhost:9980;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $http_host;
        proxy_read_timeout 36000s;
    }

    # download, presentation and image upload
    location ~ ^/lool {
        proxy_pass http://localhost:9980;
        proxy_set_header Host $http_host;
    }

    # Admin Console websocket
    location ^~ /lool/adminws {
        proxy_pass http://localhost:9980;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $http_host;
        proxy_read_timeout 36000s;
    }
}
