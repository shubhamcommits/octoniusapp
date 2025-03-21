#!/bin/bash

# Octonius stop development server

echo "Stoping all the node services..."

# Stops and kills the client server from port 4200
pm2 stop client-server
pm2 delete client-server
