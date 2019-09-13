#!/bin/bash
# Octonius image deployment to Docker Hub

# current working branch
gitbranch='master'

# export the githash to be used on image names
git checkout $gitbranch \
        && git pull \
        # && export GITHASH=$(git rev-parse HEAD) \
        && export CLIENT_IMAGE_NAME=octoniusapp/octonius:client \
        && export API_IMAGE_NAME=octoniusapp/octonius:api \
        && export NGINX_IMAGE_NAME=octoniusapp/octonius:nginx \
        && docker build -t $CLIENT_IMAGE_NAME ./client \
        && docker build -t $API_IMAGE_NAME ./api \
        && docker build -t $NGINX_IMAGE_NAME ./nginx \
        && docker login \
        && docker push $CLIENT_IMAGE_NAME \
        && docker push $API_IMAGE_NAME \
        && docker push $NGINX_IMAGE_NAME \
        && docker stack deploy -c stack-octonius-deploy.yml octonius
        # && vim stack-octonius.yml -c '%s/GIT_HASH/\=expand($GITHASH)/g | w! stack-deploy-octonius.yml | qa!' \
        # && scp stack-deploy-octonius.yml ubuntu@86.122.94.224:~/alphaoctonius/ 


