#!/bin/bash

# Octonius development server

export NODE_OPTIONS=--max_old_space_size=4096 #this was added to help build on linux and avoid memory allocation heaps error


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
if [ "$n" == 2 ]

then
    packageManager="yarn"

# Else package manager is npm
else
    packageManager="npm"

fi
    # Assign Current workdir
    mainDir=$PWD

    # Go to client directory
    cd "client"

    # Echo the Status
    echo -e "\n \t Starting Client Service..."

    # Start the process and push it to background
    pm2 start "$packageManager run dev" --name "client-server" --wait-ready &

    # Wait for process to get completed
    wait

    # Echo the status
    echo -e "\n \t $service Service has been started successfully!"  

    # Go back to main working directory(i.e. - /)
    cd -
