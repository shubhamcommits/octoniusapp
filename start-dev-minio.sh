#!/bin/bash

# Octonius development server

echo -e "\n \t ============================ |- Welcome to Octonius Development Server -| ========================== \n"

minio server --console-address :9090 uploads/minio
