#!/bin/bash


# Octonius Build Docker Images

export CLIENT_IMAGE_NAME=octoniusapp/octonius-alpha:client
export MAILS_IMAGE_NAME=octoniusapp/octonius-alpha:mailing-server
          export AUTHS_IMAGE_NAME=octoniusapp/octonius-alpha:auths-server
          export GROUPS_IMAGE_NAME=octoniusapp/octonius-alpha:groups-server
          export WORKSPACES_IMAGE_NAME=octoniusapp/octonius-alpha:workspaces-server
          export USERS_IMAGE_NAME=octoniusapp/octonius-alpha:users-server
          export POSTS_IMAGE_NAME=octoniusapp/octonius-alpha:posts-server
          export NOTIFICATIONS_IMAGE_NAME=octoniusapp/octonius-alpha:notifications-server
          export UTILITIES_IMAGE_NAME=octoniusapp/octonius-alpha:utilities-server
          export NGINX_IMAGE_NAME=octoniusapp/octonius-alpha:nginx
          # build the Docker image (this will use the Dockerfile in the root of the repo)
          docker build -t $CLIENT_IMAGE_NAME ./client-upgrade/client
          docker build -t $MAILS_IMAGE_NAME ./services/mailing/server
          docker build -t $AUTHS_IMAGE_NAME ./services/authentication/server
          docker build -t $GROUPS_IMAGE_NAME ./services/groups/server
          docker build -t $WORKSPACES_IMAGE_NAME ./services/workspaces/server
          docker build -t $USERS_IMAGE_NAME ./services/users/server
          docker build -t $POSTS_IMAGE_NAME ./services/posts/server
          docker build -t $NOTIFICATIONS_IMAGE_NAME ./services/notifications/server
          docker build -t $UTILITIES_IMAGE_NAME ./services/utilities/server
          docker build -t $NGINX_IMAGE_NAME ./nginx
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
          docker push $NGINX_IMAGE_NAME