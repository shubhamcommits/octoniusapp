#!/bin/bash

# Octonius Build Docker Images

# Client Microservice Image Name
export CLIENT_IMAGE_NAME=octoniusapp/octonius:client

# Mails Microservice Image Name
export MAILS_IMAGE_NAME=octoniusapp/octonius:mailing-server

# Auths Microservice Image Name
export AUTHS_IMAGE_NAME=octoniusapp/octonius:auths-server

# Groups Microservice Image Name
export GROUPS_IMAGE_NAME=octoniusapp/octonius:groups-server

# Workspaces Microservice Image Name
export WORKSPACES_IMAGE_NAME=octoniusapp/octonius:workspaces-server

# Users Microservice Image Name
export USERS_IMAGE_NAME=octoniusapp/octonius:users-server

# Posts Microservice Image Name
export POSTS_IMAGE_NAME=octoniusapp/octonius:posts-server

# Notifications Microservice Image Name
export NOTIFICATIONS_IMAGE_NAME=octoniusapp/octonius:notifications-server

# Utilities Microservice Image Name
export UTILITIES_IMAGE_NAME=octoniusapp/octonius:utilities-server

# Folio Microservice Image Name
export FOLIO_IMAGE_NAME=octoniusapp/octonius:folio-server

# SEARCH Microservice Image Name
export SEARCH_IMAGE_NAME=octoniusapp/octonius:search-server

# Nginx Image Name
export NGINX_IMAGE_NAME=octoniusapp/octonius:nginx

# build the Docker image (this will use the Dockerfile in the root of the repo)
        docker build -t $CLIENT_IMAGE_NAME --compress=true --force-rm=true ./client
        docker build -t $MAILS_IMAGE_NAME --compress=true --force-rm=true ./services/mailing/server
        docker build -t $AUTHS_IMAGE_NAME --compress=true --force-rm=true ./services/authentication/server
        docker build -t $GROUPS_IMAGE_NAME --compress=true --force-rm=true ./services/groups/server
        docker build -t $WORKSPACES_IMAGE_NAME --compress=true --force-rm=true ./services/workspaces/server
        docker build -t $USERS_IMAGE_NAME --compress=true --force-rm=true ./services/users/server
        docker build -t $POSTS_IMAGE_NAME --compress=true --force-rm=true ./services/posts/server
        docker build -t $NOTIFICATIONS_IMAGE_NAME --compress=true --force-rm=true ./services/notifications/server
        docker build -t $UTILITIES_IMAGE_NAME --compress=true --force-rm=true ./services/utilities/server
        docker build -t $FOLIO_IMAGE_NAME --compress=true --force-rm=true ./services/folio/server
        docker build -t $SEARCH_IMAGE_NAME --compress=true --force-rm=true ./services/search-service
        docker build -t $NGINX_IMAGE_NAME --compress=true --force-rm=true ./nginx

# Clear unnecessary Image build
        docker image prune -f 


# authenticate with the Docker Hub registry
        docker login

# push the new Docker image to the Docker registry
        docker push $CLIENT_IMAGE_NAME
        docker push $MAILS_IMAGE_NAME
        docker push $AUTHS_IMAGE_NAME
        docker push $GROUPS_IMAGE_NAME
        docker push $WORKSPACES_IMAGE_NAME
        docker push $USERS_IMAGE_NAME
        docker push $POSTS_IMAGE_NAME
        docker push $NOTIFICATIONS_IMAGE_NAME
        docker push $UTILITIES_IMAGE_NAME
        docker push $FOLIO_IMAGE_NAME
        docker push $SEARCH_IMAGE_NAME
        docker push $NGINX_IMAGE_NAME