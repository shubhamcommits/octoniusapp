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

# Auths Microservice Image Name
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

# Minio Image
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
          docker pull $CLIENT_IMAGE_NAME
          docker pull $NGINX_IMAGE_NAME
          docker pull $MINIO_IMAGE_NAME


# Save docker images

rm -rf docker-images
mkdir -p "docker-images"
## Discrete list of images to save
echo "Save $MONGO_IMAGE_NAME"
docker save $MONGO_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.mongodb.tar.gz"
echo "Save $APPROVAL_IMAGE_NAME"
docker save $APPROVAL_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.approval-server.tar.gz"
echo "Save $AUTHS_IMAGE_NAME"
docker save $AUTHS_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.auths-server.tar.gz"
echo "Save $CHATS_IMAGE_NAME"
docker save $CHATS_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.chats-server.tar.gz"
echo "Save $GROUPS_IMAGE_NAME"
docker save $GROUPS_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.groups-server.tar.gz"
echo "Save $WORKSPACES_IMAGE_NAME"
docker save $WORKSPACES_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.workspaces-server.tar.gz"
echo "Save $USERS_IMAGE_NAME"
docker save $USERS_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.users-server.tar.gz"
echo "Save $POSTS_IMAGE_NAME"
docker save $POSTS_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.posts-server.tar.gz"
echo "Save $NOTIFICATIONS_IMAGE_NAME"
docker save $NOTIFICATIONS_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.notifications-server.tar.gz"
echo "Save $UTILITIES_IMAGE_NAME"
docker save $UTILITIES_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.notifications-server.tar.gz"
echo "Save $FOLIO_IMAGE_NAME"
docker save $FOLIO_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.folio-server.tar.gz"
echo "Save $SEARCH_IMAGE_NAME"
docker save $SEARCH_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.search-server.tar.gz"
echo "Save $INTEGRATIONS_IMAGE_NAME"
docker save $INTEGRATIONS_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.integrations-server.tar.gz"
echo "Save $FLAMINGO_IMAGE_NAME"
docker save $FLAMINGO_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.flamingo-server.tar.gz"
echo "Save $LIBREOFFICE_IMAGE_NAME"
docker save $LIBREOFFICE_IMAGE_NAME | gzip > "docker-images/${DOCKER_REPO}.libreoffice-server.tar.gz"
echo "Save $CLIENT_IMAGE_NAME"
docker save $CLIENT_IMAGE_NAME | gzip > "docker-images/$DOCKER_REPO.client.tar.gz"
echo "Save $NGINX_IMAGE_NAME"
docker save $NGINX_IMAGE_NAME | gzip > "docker-images/$DOCKER_REPO.nginx.tar.gz"