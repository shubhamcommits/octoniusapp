#!/bin/bash

# Octonius stop compose services

# Stop the Services
docker-compose -f deploy-octonius-acc.yml -p octonius down
