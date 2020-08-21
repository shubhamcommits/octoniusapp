#!/bin/bash

# Octonius development server

export HOST_PASSWORD=Ilinca20!8

export HOST_ADDRESS=ubuntu@86.120.164.146

# sshpass -p $HOST_PASSWORD ssh -t $HOST_ADDRESS "cd /home/ubuntu/octonius; echo $HOST_PASSWORD | sudo -S ./deploy-swarm.sh"

sshpass -p $HOST_PASSWORD ssh -t -t $HOST_ADDRESS 'bash -s' <<< ls