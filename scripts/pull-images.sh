#!/bin/bash

# Docker Username
DOCKER_USER=octoniusapp
DOCKER_REPO=octonius-prod

# Octonius Pull Docker Images

# Import Environment Variables
set -o allexport
source .env
set +o allexport

# Authenticate with the Docker Hub registry
docker login

# Client Microservice Image Name
CLIENT_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:client

# Approval Microservice Image Name
APPROVAL_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:approval-server

# Auths Microservice Image Name
AUTHS_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:auths-server

# Chats Microservice Image Name
CHATS_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:chats-server

# Groups Microservice Image Name
GROUPS_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:groups-server

# Workspaces Microservice Image Name
WORKSPACES_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:workspaces-server

# Users Microservice Image Name
USERS_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:users-server

# Posts Microservice Image Name
POSTS_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:posts-server

# Notifications Microservice Image Name
NOTIFICATIONS_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:notifications-server

# Utilities Microservice Image Name
UTILITIES_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:utilities-server

# Folio Microservice Image Name
FOLIO_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:folio-server

# Search Microservice Image Name
SEARCH_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:search-server

# Integrations Microservice Image Name
INTEGRATIONS_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:integrations-server

# Flamingo Microservice Image Name
FLAMINGO_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:flamingo-server

# Libreoffice Image Name
LIBREOFFICE_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:libreoffice-server

# Libreoffice Image Name
MINIO_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:minio

# Nginx Image Name
NGINX_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:nginx

# Mongo Image Name
MONGO_IMAGE_NAME=${DOCKER_USER}/${DOCKER_REPO}:mongodb

# Pull the new Docker image from the Docker registry
          docker pull $MONGO_IMAGE_NAME
          docker pull $APPROVAL_IMAGE_NAME
          docker pull $AUTHS_IMAGE_NAME
          docker pull $CHATS_IMAGE_NAME
          docker pull $GROUPS_IMAGE_NAME
          docker pull $WORKSPACES_IMAGE_NAME
          docker pull $USERS_IMAGE_NAME
          docker pull $POSTS_IMAGE_NAME
          docker pull $NOTIFICATIONS_IMAGE_NAME
          docker pull $UTILITIES_IMAGE_NAME
          docker pull $FOLIO_IMAGE_NAME
          docker pull $SEARCH_IMAGE_NAME
          docker pull $INTEGRATIONS_IMAGE_NAME
          docker pull $FLAMINGO_IMAGE_NAME
          docker pull $LIBREOFFICE_IMAGE_NAME
          docker pull $MINIO_IMAGE_NAME
          docker pull $CLIENT_IMAGE_NAME
          docker pull $NGINX_IMAGE_NAME