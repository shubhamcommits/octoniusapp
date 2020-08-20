#!/bin/bash

# Octonius development server

# Define the service Directory array
serviceArray=( 'mailing-server' 'auths-server' 'groups-server' 'workspaces-server' 'search-server' 'users-server' 'utilities-server' 'notifications-server' 'posts-server' )

# Loop through all the directories and install the packages 
for i in "${serviceArray[@]}"
do
    # Slice the name of service from the entire directory name
    service="$(cut -d'/' -f1 <<<"$i")"

    # Stop the process
    pm2 stop $service

    # Delete the process
    pm2 delete $service

    # Wait for process to get completed
    wait

done