#!/bin/bash

# Octonius Development Services Installation Script

echo -e "\n \t ============================ |- Welcome to Octonius Development Server -| ========================== \n"


# Fetching the OS Details
UNAME=$( command -v uname)

case $( "${UNAME}" | tr '[:upper:]' '[:lower:]') in
  
  linux*)

    printf 'Your OS is Linux\n'
        
    wget https://dl.min.io/server/minio/release/linux-amd64/minio
    chmod +x minio
    sudo mv minio /usr/local/bin/
    ;;
  
  darwin*)
    printf 'Your OS is Darwin\n'
    case $( "${UNAME}" -m | tr '[:upper:]' '[:lower:]') in

        arm64*)

            curl -O https://dl.min.io/server/minio/release/darwin-arm64/minio
            chmod +x minio
            sudo mv minio /usr/local/bin/
            ;;

        *)

            curl -O https://dl.min.io/server/minio/release/darwin-amd64/minio
            chmod +x minio
            sudo mv minio /usr/local/bin/
            ;;

    esac
    ;;
  
  *)
    printf 'Cannot proceed with the installation, please contact the octonius dev team!\n'
    exit 1
    ;;
esac