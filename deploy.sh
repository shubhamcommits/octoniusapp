#!/bin/bash
# Octonius image deployment to Docker Hub

# current working branch
# gitbranch='master'

git checkout master

git pull

docker login

docker pull octoniusapp/octonius:api

docker pull octoniusapp/octonius:client

docker pull octoniusapp/octonius:nginx

docker pull mongo:latest

docker pull redis:latest

docker stack deploy -c stack-octonius-deploy.yml octonius

# export the githash to be used on image names
# git checkout $gitbranch \
#         && git pull \
#         && export GITHASH=$(git rev-parse HEAD) \
#         && export CLIENT_IMAGE_NAME=octoniusapp/octonius-client:$GITHASH \
#         && export API_IMAGE_NAME=octoniusapp/octonius-api:$GITHASH \
#         && export NGINX_IMAGE_NAME=octoniusapp/octonius-nginx:$GITHASH \
#         && docker build -t $CLIENT_IMAGE_NAME ./public \
#         && docker build -t $API_IMAGE_NAME ./src \
#         && docker build -t $NGINX_IMAGE_NAME ./nginx \
#         && docker login \
#         && docker push $CLIENT_IMAGE_NAME \
#         && docker push $API_IMAGE_NAME \
#         && docker push $NGINX_IMAGE_NAME \
#         && vim stack-octonius.yml -c '%s/GIT_HASH/\=expand($GITHASH)/g | w! stack-deploy-octonius.yml | qa!' \
#         && scp stack-deploy-octonius.yml ubuntu@86.122.94.224:~/alphaoctonius/ 


