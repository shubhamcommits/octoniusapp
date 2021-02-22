#!/bin/bash

# Octonius Pull Docker Images

# Import Environment Variables
set -o allexport
source .env
set +o allexport

# Authenticate with the Docker Hub registry
docker login

# Pull the new Docker image to the Docker registry
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
          docker pull $INTEGRATIONS_IMAGE_NAME
          docker pull $CLIENT_IMAGE_NAME
          docker pull $NGINX_IMAGE_NAME