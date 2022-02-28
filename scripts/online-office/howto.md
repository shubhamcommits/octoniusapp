# Online Office Setup

---
##### ENV Variables
First you need to add/change in the `.env` the following values
```
LIBREOFFICE_PROTOCOL=https
LIBREOFFICE_DOMAIN=<APP-URL> 
LIBREOFFICE_USERNAME=admin
LIBREOFFICE_PASSWORD=password
```

The `LIBREOFFICE_DOMAIN` is the allowed domain to access the office server, in order for the documents to open, the initiator domain must be equal with the value of `LIBREOFFICE_DOMAIN`.

In the `.env` file there should check for the presence of key/value `LIBREOFFICE_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:libreoffice-server`

----
##### SSL Termination [info](https://avinetworks.com/glossary/ssl-termination)
![ssl termination graphic](https://avinetworks.com/wp-content/uploads/2018/12/ssl-termination-diagram.png)

You would need to define a domain for the office-server (i.e. `docs.example.com`) and traffic should be redirected to the **office-server** on port `9980` over a private network.

There is an example `nginx-ssl-termination.conf` that you can use to proxy forward traffic to the office-server.

Change the <URL> in the file for the libreoffice domail selected.

**Nginx Conf Example**

```
upstream octonius-office {
        server localhost:9980; # Redirect Traffic to Office Server, use private IP or local dns entry
        zone octonius-office 64k;
        hash $arg_WOPISrc;
}
server {
        server_name <URL>;
        add_header 'Content-Security-Policy' 'upgrade-insecure-requests';        

        access_log /var/log/nginx/office.access.log;
        error_log /var/log/nginx/office.error.log warn;

        # static files
        location ^~ /browser {
            proxy_pass http://octonius-office;
            proxy_set_header Host $http_host;
        }
        # WOPI discovery URL
        location ^~ /hosting/discovery {
            keepalive_timeout 1;
            proxy_pass http://octonius-office;
            proxy_set_header Host $http_host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_redirect off;
            proxy_set_header X-Forwarded-Proto https;
         }
        # capabilities
        location ^~ /hosting/capabilities {
            keepalive_timeout 1;
            proxy_pass http://octonius-office;
            proxy_set_header Host $http_host;
        }
        # main websocket
        location ~ ^/cool/(.*)/ws$ {
            proxy_pass http://octonius-office;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $http_host;
            proxy_read_timeout 36000s;
        }
        # download, presentation and image upload
        location ~ ^/(c|l)ool {
            keepalive_timeout 1; # force close soket due to issue on closing connection header
            proxy_pass http://octonius-office;
            proxy_set_header Host $http_host;
        }
        # Admin Console websocket
        location ^~ /cool/adminws {
            proxy_pass http://octonius-office;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $http_host;
            proxy_read_timeout 36000s;
        }

    ## Add SSL certificates
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/<URL>/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/<URL>/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    resolver 1.1.1.1 1.0.0.1 [2606:4700:4700::1111] [2606:4700:4700::1001]; # Cloudflare
}
server {
    if ($host = <URL>) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    server_name <URL>;
    listen 80;
    return 404; # managed by Certbot
}
```

