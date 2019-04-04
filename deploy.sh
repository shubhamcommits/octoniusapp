#!/bin/bash
# Octonius deployment on premise

# current working branch
gitbranch='sqshdocker'

# export the githash to be used by stack-octonius.yml
git checkout $gitbranch \
        && git pull \
        && export GITHASH=$(git rev-parse HEAD)

# deploy stack
sudo docker stack deploy -c stack-octonius.yml alphaoctonius --with-registry-auth

