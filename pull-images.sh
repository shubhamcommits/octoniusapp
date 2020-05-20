#!/bin/bash

# Octonius Pull Docker Images

# Client Microservice Image Name
export CLIENT_IMAGE_NAME=octoniusapp/octonius-alpha:client

# Mails Microservice Image Name
export MAILS_IMAGE_NAME=octoniusapp/octonius-alpha:mailing-server

# Auths Microservice Image Name
export AUTHS_IMAGE_NAME=octoniusapp/octonius-alpha:auths-server

# Groups Microservice Image Name
export GROUPS_IMAGE_NAME=octoniusapp/octonius-alpha:groups-server

# Workspaces Microservice Image Name
export WORKSPACES_IMAGE_NAME=octoniusapp/octonius-alpha:workspaces-server

# Users Microservice Image Name
export USERS_IMAGE_NAME=octoniusapp/octonius-alpha:users-server

# Posts Microservice Image Name
export POSTS_IMAGE_NAME=octoniusapp/octonius-alpha:posts-server

# Notifications Microservice Image Name
export NOTIFICATIONS_IMAGE_NAME=octoniusapp/octonius-alpha:notifications-server

# Utilities Microservice Image Name
export UTILITIES_IMAGE_NAME=octoniusapp/octonius-alpha:utilities-server

# Folio Microservice Image Name
export FOLIO_IMAGE_NAME=octoniusapp/octonius-alpha:folio-server

# Query Microservice Image Name
export QUERY_IMAGE_NAME=octoniusapp/octonius-alpha:query-server

# Nginx Image Name
export NGINX_IMAGE_NAME=octoniusapp/octonius-alpha:nginx

# authenticate with the Docker Hub registry
          docker login

# pull the new Docker image to the Docker registry
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
          docker pull $QUERY_IMAGE_NAME
          docker pull $NGINX_IMAGE_NAME