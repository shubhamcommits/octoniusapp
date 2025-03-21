#!/bin/bash

# Octonius release client applications

echo -e "\n \t ============================ |- Welcome to Octonius Client Application Server -| ========================== \n"
echo -e "\t Kindly choose the package manager below to start releasing the application(type the option number)..."
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

    # Release the application for macOS
    $packageManager run app:mac

    # Release the application for linux
    $packageManager run app:linux

    # Release the application for windows
    $packageManager run app:windows