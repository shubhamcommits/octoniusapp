#!/bin/bash

#echo "do you want to start restore process to new DB type true or false"
#read process
echo " restore db = $process"
#if [[ "$process" == "true" ]]; then
## Restore DB

echo " Restore DB"

#echo " Enter Destination MongoDB Host "
#read desthost
#echo "Destination mongoDB host Is $desthost"
#echo
#echo " Enter Destination mongoDB database name "
#read destdbname
#echo " Destination mongoDB name is $destdbname"
#echo

mongorestore --host mongo-0.mongo:27011 --db=octonius /tmp/octonius_dump/octonius/

#fi
