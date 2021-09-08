#!/bin/bash
# Octonius image deployment to Docker Hub

# Import Environment Variables
set -o allexport
source .env
set +o allexport

# Make Suitable Directories
mkdir -p data \
      data/uploads \
      data/uploads/groups \
      data/uploads/posts \
      data/uploads/search\
      data/uploads/users \
      data/uploads/utilities \
      data/uploads/workspaces \
      data/uploads/flamingo \

# Give permissions to data folder
sudo chmod u+x data

# Login to dockerhub
docker login

# Pull the new Docker image from the Docker registry
          docker pull $MONGO_IMAGE_NAME
          docker pull $AUTHS_IMAGE_NAME
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
          docker pull $CLIENT_IMAGE_NAME
          docker pull $NGINX_IMAGE_NAME

# Deploy the Stack
env $(cat .env | grep ^[A-Z] | xargs) docker-compose --compatibility -f deploy-octonius-acc.yml -p octonius up -d



