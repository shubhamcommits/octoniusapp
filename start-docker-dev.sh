#!/bin/bash
# Octonius image deployment to Docker Hub

# Import Environment Variables
#set -o allexport
#source dev.env
#set +o allexport

export DOCKER_CLIENT_TIMEOUT=200
export COMPOSE_HTTP_TIMEOUT=120

# Deploy the Stack
env $(cat dev.env | grep ^[A-Z] | xargs) docker-compose --compatibility -f start-docker-dev.yml -p octonius up -d --build
#COMPOSE_HTTP_TIMEOUT=200 docker-compose --compatibility -f start-docker-dev.yml -p octonius up -d --build