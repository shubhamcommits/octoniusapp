#!/bin/bash  

# Backup source DB 
echo " backup db "

echo " Is your mongoDB has auth enable type True Or false "
read auth
echo " Your MongoDB has Auth enable=$auth"

echo "Enter MongoDB Host "
read host
echo "MongoDB Host is $host
echo "Enter Port :
read port
echo "Enter DB name "
read dbname
echo " Database Name Is $dbname"

if [[ "$auth" == "true" ]]; then

	echo " Enter UserName for DB "
	read username
	echo "The User Name is $username"
	echo
	echo "Enter the Password for source DB "
	read password
	echo "The Password is  $password"
	mongodump --host $host:$port -u $username -p $password --forceTableScan --db=$dbname --out=/tmp/octonius_dump
       echo " successfully backup the database and backup location is = /tmp/octonius_dump "

else
        mongodump --host $host:$port --forceTableScan --db=$dbname --out=/tmp/octonius_dump
         echo " successfully backup the database and backup location is = /tmp/octonius_dump "
fi
