#!/bin/bash

# Octonius Build Docker Images

# Import Environment Variables
set -o allexport
source .env
set +o allexport

# build the Docker image (this will use the Dockerfile in the root of the repo)
        docker build -t $CLIENT_IMAGE_NAME --compress=true --force-rm=true ../client
        docker build -t $MAILS_IMAGE_NAME --compress=true --force-rm=true ../services/mailing/server
        docker build -t $AUTHS_IMAGE_NAME --compress=true --force-rm=true ../services/authentication/server
        docker build -t $GROUPS_IMAGE_NAME --compress=true --force-rm=true ../services/groups/server
        docker build -t $WORKSPACES_IMAGE_NAME --compress=true --force-rm=true ../services/workspaces/server
        docker build -t $USERS_IMAGE_NAME --compress=true --force-rm=true ../services/users/server
        docker build -t $POSTS_IMAGE_NAME --compress=true --force-rm=true ../services/posts/server
        docker build -t $NOTIFICATIONS_IMAGE_NAME --compress=true --force-rm=true ../services/notifications/server
        docker build -t $UTILITIES_IMAGE_NAME --compress=true --force-rm=true ../services/utilities/server
        docker build -t $FOLIO_IMAGE_NAME --compress=true --force-rm=true ../services/folio/server
        docker build -t $SEARCH_IMAGE_NAME --compress=true --force-rm=true ../services/search/server
        docker build -t $INTEGRATIONS_IMAGE_NAME --compress=true --force-rm=true ../services/integrations/server
        docker build -t $NGINX_IMAGE_NAME --compress=true --force-rm=true ../nginx

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
        docker push $INTEGRATIONS_IMAGE_NAME
        docker push $NGINX_IMAGE_NAME