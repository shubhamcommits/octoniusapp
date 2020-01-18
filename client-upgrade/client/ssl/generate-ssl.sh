#!bin/bash

# OPEN SSL to generate new certificate and the key for local development

openssl req \
    -newkey rsa:2048 \
    -x509 \
    -nodes \
    -keyout ssl/server.key \
    -new \
    -out ssl/server.crt \
    -config ./open-ssl.cnf \
    -sha256 \
    -days 365