#!/bin/bash

# Octonius stop stack services

# Remove the stack and services
docker stack rm octonius
#docker-compose -f deploy-octonius-prod.yml -p octonius down