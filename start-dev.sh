#!/bin/bash

# Octonius development server

echo -e "\n \t ============================ |- Welcome to Octonius Development Server -| ========================== \n"
echo -e "\t Kindly choose the package manager below to start the application locally(type the option number)..."
echo "  1) npm"
echo "  2) yarn"

read n

case $n in
  1) echo "You have selected npm as your package manager";;
  2) echo "You have selected yarn as your package manager";;
  *) echo "Default option 'npm' is selected";;
esac

# Package Manager Variable
packageManager="npm"

# Checking if Selected package manager is npm
if [ "$n" == 1 ]

then
    packageManager="npm"

# Else package manager is yarn
else
    packageManager="yarn"

fi
    # Assign Current workdir
    mainDir=$PWD
    
    # Go to services directory
    cd services

    : '|- MAILING SERVER -|'
    # Go to mailing directory
    cd mailing/server

    # Start the dev server and push the process into background - port 2000
    pm2 start "$packageManager run dev" --name "mailing-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- AUTHENTICATION SERVER -|'

    # Go to authentication directory
    cd authentication/server

    # Start the dev server and push the process into background - port 3000
    pm2 start "$packageManager run dev" --name "auths-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- GROUPS SERVER -|'

    # Go to groups directory
    cd groups/server

    # Start the dev server and push the process into background - port 4000
    pm2 start "$packageManager run dev" --name "groups-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- WORKSPACE SERVER -|'
    # Go to workspaces directory
    cd workspaces/server

    # Start the dev server and push the process into background - port 5000
    pm2 start "$packageManager run dev" --name "workspaces-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- USERS SERVER -|'
    # Go to users directory
    cd users/server

    # Start the dev server and push the process into background - port 7000
    pm2 start "$packageManager run dev" --name "users-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- POSTS SERVER -|'
    # Go to posts directory
    cd posts/server

    # Start the dev server and push the process into background - port 8000
    pm2 start "$packageManager run dev" --name "posts-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- NOTIFICATIONS SERVER -|'
    # Go to notifications directory
    cd notifications/server

    # Start the dev server and push the process into background - port 9000
    pm2 start "$packageManager run dev" --name "notifications-server"

    # Go back to main working directory(i.e. - services/)
    cd -

    : '|- UTILITIES SERVER -|'
    # Go to utilities directory
    cd utilities/server

    # Start the dev server and push the process into background - port 10000
    pm2 start "$packageManager run dev" --name "utilities-server"

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