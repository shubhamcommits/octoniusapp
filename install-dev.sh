#!/bin/bash

# Octonius Development Services Installation Script

echo -e "\n \t ============================ |- Welcome to Octonius Development Server -| ========================== \n"
echo -e "\t Kindly choose the package manager below to start installing the services locally (type the option number)..."
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

# Fetching the OS Details
UNAME=$( command -v uname)

case $( "${UNAME}" | tr '[:upper:]' '[:lower:]') in
  
  linux*)

    printf 'Your OS is Linux\n'
        
    # Installing pm2 globally on Linux
    if [ "$packageManager" == "npm" ]

    then    
        sudo $packageManager -g install pm2 --force

    else
        sudo $packageManager global add pm2

    fi
    ;;
  
  darwin*)
    printf 'Your OS is Darwin\n'
        
    # Installing pm2 globally on MacOS
    if [ "$packageManager" == "npm" ]

    then    
        sudo $packageManager -g install pm2 --force

    else
        sudo $packageManager global add pm2

    fi
    ;;
  
  msys*|cygwin*|mingw*)
    printf 'Your OS is Windows\n'

    # Installing pm2 globally on Windows
    if [ "$packageManager" == "npm" ]

    then    
        $packageManager -g install pm2 --force

    else
        $packageManager global add pm2

    fi
    ;;
  
  nt|win*)
    printf 'Your OS is Windows\n'

    # Installing pm2 globally on Windows
    if [ "$packageManager" == "npm" ]

    then    
        $packageManager -g install pm2 --force

    else
        $packageManager global add pm2

    fi
    ;;
  
  *)
    printf 'Cannot proceed with the installation, please contact the octonius dev team!\n'
    exit 1
    ;;
esac

# Assign Current workdir
mainDir=$PWD

# Go to services directory
cd services

# Define the service Directory array
serviceArray=( 'authentication/server' 'groups/server' 'workspaces/server' 'search/server' 'users/server' 'posts/server' 'notifications/server' 'integrations/server' 'utilities/server' 'folio/server' 'flamingo/server' 'libreoffice' 'client' )

# Loop through all the directories and install the packages 
for i in "${serviceArray[@]}"
do
    if [ "$i" == 'client' ]
        
    then
        cd $mainDir
    
    fi

    # Go to service directory
    cd $i

    # Removing the lock files
    rm -rf yarn.lock package-lock.json node_modules

    # Service Name
    service="$(cut -d'/' -f1 <<<"$i")"

    # Echo the Status
    echo -e "\n \t Installing $service service..."

    # Create Uploads Folder
    mkdir -p uploads

    # Start the process and push it to background
    $packageManager install &

    # Wait for process to get completed
    wait

    # Echo the status
    echo -e "\n \t $service service installed successfully!"  

    # Go back to main working directory(i.e. - services/)
    cd -
done
