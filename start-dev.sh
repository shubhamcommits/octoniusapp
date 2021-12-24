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
if [ "$n" == 2 ]

then
    packageManager="yarn"

# Else package manager is npm
else
    packageManager="npm"

fi
    # Assign Current workdir
    mainDir=$PWD
    
    # Go to services directory
    cd services

    # Define the service Directory array
    serviceArray=( 'authentication/server' 'groups/server' 'workspaces/server' 'search/server' 'users/server' 'posts/server' 'notifications/server' 'integrations/server' 'utilities/server' 'folio/server' 'flamingo/server' 'approval/server' 'client' )

    # Loop through all the directories and install the packages 
    for i in "${serviceArray[@]}"
    do
        # Slice the name of service from the entire directory name
        service="$(cut -d'/' -f1 <<<"$i")"

        # If Directory is client
        if [ "$i" == 'client' ]
            
        then
            cd $mainDir
            service="client"
        
        fi

        # If Directory is authentication
        if [ "$service" == "authentication" ]
            
        then
            service="auths"
        
        fi

        # Go to service directory
        cd $i

        # Echo the Status
        echo -e "\n \t Starting $service Service..."

        # Start the process and push it to background
        pm2 start "$packageManager run dev" --name "$service-server"

        # Wait for process to get completed
        wait

        # Echo the status
        echo -e "\n \t $service Service has been started successfully!"  

        # Go back to main working directory(i.e. - services/)
        cd -
    done
