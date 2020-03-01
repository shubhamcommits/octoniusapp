#!/bin/bash

# Octonius stop development server

echo "Stoping all the node services..."

# Defining the number of ports
PORT_NUMBERS=([1]=2000 [2]=3000 [3]=4000 [4]=4200 [5]=5000 [6]=7000 [7]=9000)

# Loop through all the port numbers and remove the running services in the background
for i in "${PORT_NUMBERS[@]}"
do
   lsof -i tcp:$i | awk 'NR!=1 {print $2}' | xargs kill 
   echo "Process running on $i has been stopped"
done

# Send status that all the services have been stopped
echo "All the services have been stopped, terminal will exit soon..."

# Exit out of the script
exec sleep 3