# Online Office Setup

---
##### ENV Variables
Firs you need to add/change in the `.env` the following values
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


##### Build the docker image

To build the docker image use `docker build local_office`. Please keep in mind that this can take several hours depending on your system.

The image default build arguments are based on the remote upstream, for a more convinient security patch.

To modifiy them use `docker build --build-arg COLLABORA_ONLINE_BRANCH=<> ...`

```
### Environment Variables
ENV COLLABORA_ONLINE_BRANCH=${COLLABORA_ONLINE_BRANCH:-"master"} \
    COLLABORA_ONLINE_VERSION=${COLLABORA_ONLINE_VERSION:-"cp-21.11.2-2"} \
    COLLABORA_ONLINE_REPO_URL=${COLLABORA_ONLINE_REPO_URL:-"https://github.com/CollaboraOnline/online"} \
    #
    LIBREOFFICE_BRANCH=${LIBREOFFICE_BRANCH:-"master"} \
    LIBREOFFICE_VERSION=${LIBREOFFICE_VERSION:-"cp-21.06.16-1"} \
    LIBREOFFICE_REPO_URL=${LIBREOFFICE_REPO_URL:-"https://github.com/LibreOffice/core"} \
    #
    APP_NAME=${APP_NAME:-"Document Editor"} \
    #
    POCO_VERSION=${POCO_VERSION:-"poco-1.11.1-release.tar.gz"} \
    POCO_URL=${POCO_URL:-"https://github.com/pocoproject/poco/archive/"} \
    #
    MAX_CONNECTIONS=${MAX_CONNECTIONS:-"100000"} \
    ## Uses Approximately 20mb per document open
    MAX_DOCUMENTS=${MAX_DOCUMENTS:-"100000"}
```