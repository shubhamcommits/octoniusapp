#!/bin/bash

# Octonius development server

    # Assign Current workdir
    mainDir=$PWD
    
    # Go to services directory
    cd services

    : '|- MAILING SERVER -|'
    # Go to mailing directory
    cd mailing/server

    # Start the dev server and push the process into background - port 2000
    yarn install &

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- AUTHENTICATION SERVER -|'

    # Go to authentication directory
    cd authentication/server

    # Start the dev server and push the process into background - port 3000
    yarn install &

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- GROUPS SERVER -|'

    # Go to groups directory
    cd groups/server

    # Start the dev server and push the process into background - port 4000
    yarn install &

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- WORKSPACE SERVER -|'
    # Go to workspace directory
    cd workspace/server

    # Start the dev server and push the process into background - port 5000
    yarn install &

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- USERS SERVER -|'
    # Go to users directory
    cd users/server

    # Start the dev server and push the process into background - port 7000
    yarn install &

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- SOCKETS SERVER -|'
    # Go to sockets directory
    cd sockets/server

    # Start the dev server and push the process into background - port 9000
    yarn install &

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- CLIENT SERVER -|'
    
    # Checkout to main directory
    cd $mainDir

    # Go to the client directory
    cd client-upgrade/client

    # Start the dev server and push the process into background - port 4200
    yarn install &

    exit