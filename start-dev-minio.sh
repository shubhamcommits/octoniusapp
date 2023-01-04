#!/bin/bash

# Octonius development server

echo -e "\n \t ============================ |- Welcome to Octonius Development Server -| ========================== \n"
echo -e "\t Choose a port for minio server..."
read n

minio server --address :$n --console-address :9090 uploads/minio
