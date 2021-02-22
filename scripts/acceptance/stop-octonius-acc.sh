#!/bin/bash

# Octonius stop compose services

# Stop the Services
docker-compose -f compose-octonius-deploy.yml -p octonius down
