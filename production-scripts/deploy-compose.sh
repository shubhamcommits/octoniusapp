#!/bin/bash
# Octonius image deployment to Docker Hub

# Make Suitable Directories
mkdir -p data \
      data/db \
      data/uploads \
      data/uploads/groups \
      data/uploads/posts \
      data/uploads/search\
      data/uploads/users \
      data/uploads/utilities \
      data/uploads/workspaces \

# Give permissions to data folder
sudo chmod u+x data

# Login to dockerhub
docker login

# Pull the images
# Client Microservice Image Name
export CLIENT_IMAGE_NAME=octoniusapp/octonius-prod:client

# Mails Microservice Image Name
export MAILS_IMAGE_NAME=octoniusapp/octonius-prod:mailing-server

# Auths Microservice Image Name
export AUTHS_IMAGE_NAME=octoniusapp/octonius-prod:auths-server

# Groups Microservice Image Name
export GROUPS_IMAGE_NAME=octoniusapp/octonius-prod:groups-server

# Workspaces Microservice Image Name
export WORKSPACES_IMAGE_NAME=octoniusapp/octonius-prod:workspaces-server

# Users Microservice Image Name
export USERS_IMAGE_NAME=octoniusapp/octonius-prod:users-server

# Posts Microservice Image Name
export POSTS_IMAGE_NAME=octoniusapp/octonius-prod:posts-server

# Notifications Microservice Image Name
export NOTIFICATIONS_IMAGE_NAME=octoniusapp/octonius-prod:notifications-server

# Utilities Microservice Image Name
export UTILITIES_IMAGE_NAME=octoniusapp/octonius-prod:utilities-server

# Folio Microservice Image Name
export FOLIO_IMAGE_NAME=octoniusapp/octonius-prod:folio-server

# Search Microservice Image Name
export SEARCH_IMAGE_NAME=octoniusapp/octonius-prod:search-server

# Integrations Microservice Image Name
export INTEGRATIONS_IMAGE_NAME=octoniusapp/octonius-prod:integrations-server

# Nginx Image Name
export NGINX_IMAGE_NAME=octoniusapp/octonius-prod:nginx

# Mongo Image Name
export MONGO_IMAGE_NAME=mongo:latest

# pull the new Docker image to the Docker registry
      docker pull $MONGO_IMAGE_NAME
      docker pull $CLIENT_IMAGE_NAME
      docker pull $MAILS_IMAGE_NAME
      docker pull $AUTHS_IMAGE_NAME
      docker pull $GROUPS_IMAGE_NAME
      docker pull $WORKSPACES_IMAGE_NAME
      docker pull $USERS_IMAGE_NAME
      docker pull $POSTS_IMAGE_NAME
      docker pull $NOTIFICATIONS_IMAGE_NAME
      docker pull $UTILITIES_IMAGE_NAME
      docker pull $FOLIO_IMAGE_NAME
      docker pull $SEARCH_IMAGE_NAME
      docker pull $NGINX_IMAGE_NAME
      docker pull $INTEGRATIONS_IMAGE_NAME

# Deploy the Stack
docker-compose --compatibility -f compose-octonius-deploy.yml -p octoniusprod up -d



