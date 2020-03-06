#!/bin/bash

# Octonius development server

if sudo service mongodb start

then 
    echo "Mongodb service started!"

    # Assign Current workdir
    mainDir=$PWD
    
    # Go to services directory
    cd services

    : '|- MAILING SERVER -|'
    # Go to mailing directory
    cd mailing/server

    # Start the dev server and push the process into background - port 2000
    pm2 start "yarn run dev" --name "mailing-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- AUTHENTICATION SERVER -|'

    # Go to authentication directory
    cd authentication/server

    # Start the dev server and push the process into background - port 3000
    pm2 start "yarn run dev" --name "auths-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- GROUPS SERVER -|'

    # Go to groups directory
    cd groups/server

    # Start the dev server and push the process into background - port 4000
    pm2 start "yarn run dev" --name "groups-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- WORKSPACE SERVER -|'
    # Go to workspace directory
    cd workspace/server

    # Start the dev server and push the process into background - port 5000
    pm2 start "yarn run dev" --name "workspaces-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- USERS SERVER -|'
    # Go to users directory
    cd users/server

    # Start the dev server and push the process into background - port 7000
    pm2 start "yarn run dev" --name "users-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- SOCKETS SERVER -|'
    # Go to sockets directory
    cd sockets/server

    # Start the dev server and push the process into background - port 9000
    pm2 start "yarn run dev" --name "sockets-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- CLIENT SERVER -|'
    
    # Checkout to main directory
    cd $mainDir

    # Go to the client directory
    cd client-upgrade/client

    # Console Message
    echo "Starting the client server..."

    # Start the dev server and push the process into background - port 4200
    pm2 start "ng serve" --name "client-server"

    # Go back to main working directory(i.e. - services/)
    cd -

else
    echo "Unable to start the mongodb service, please try again!"
    
    exit 1

fi