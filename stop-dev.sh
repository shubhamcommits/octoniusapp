#!/bin/bash

# Octonius stop development server

echo "Stoping all the node services..."

# Stops and kills the mailing server
pm2 stop mailing-server

pm2 delete mailing-server


# Stops and kills the auths server
pm2 stop auths-server

pm2 delete auths-server


# Stops and kills the groups server
pm2 stop groups-server

pm2 delete groups-server


# Stops and kills the workspace server
pm2 stop workspaces-server

pm2 delete workspaces-server


# Stops and kills the users server
pm2 stop users-server

pm2 delete users-server


# Stops and kills the posts server
pm2 stop posts-server

pm2 delete posts-server


# Stops and kills the notifications server
pm2 stop notifications-server

pm2 delete notifications-server


# Stops and kills the utilities server
pm2 stop utilities-server

pm2 delete utilities-server


# Stops and kills the folio server
pm2 stop folio-server

pm2 delete folio-server


# Stops and kills the client server
pm2 stop client-server

pm2 delete client-server

# cd services/query-service
# docker-compose down
