#!/bin/bash

# Octonius stop development server

echo "Stoping all the node services..."


# Stops and kills the auths server from port 3000
pm2 stop auths-server

pm2 delete auths-server


# Stops and kills the groups server from port 4000
pm2 stop groups-server

pm2 delete groups-server


# Stops and kills the workspace server from port 5000
pm2 stop workspaces-server

pm2 delete workspaces-server


# Stops and kills the users server from port 7000
pm2 stop users-server

pm2 delete users-server


# Stops and kills the posts server from port 8000
pm2 stop posts-server

pm2 delete posts-server


# Stops and kills the notifications server from port 9000
pm2 stop notifications-server

pm2 delete notifications-server

# Stops and kills the integrations server from port 1300
pm2 stop integrations-server

pm2 delete integrations-server

# Stops and kills the utilities server from port 10000
pm2 stop utilities-server

pm2 delete utilities-server


# Stops and kills the folio server from port 11000
pm2 stop folio-server

pm2 delete folio-server

# Stops and kills the folio server from port 11000
pm2 stop flamingo-server

pm2 delete flamingo-server

# Stops and kills the search server from port 12000
pm2 stop search-server

pm2 delete search-server

# Stops and kills the libreoffice server from port 11200
pm2 stop libreoffice

pm2 delete libreoffice


# Stops and kills the client server from port 4200
pm2 stop client-server

pm2 delete client-server

