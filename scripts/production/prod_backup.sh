#!/bin/bash  

# Import Environment Variables
set -o allexport
source .env
set +o allexport

# Backup source DB 
echo " starting backup of your mongodb database = $DBNAME from host =$HOSTNAME "

mongodump --host $HOSTNAME --forceTableScan --db=$DBNAME --out=/tmp/prod_octonius_dump

echo " successfully backup the database $DBNAME and backup location is = /tmp/prod_octonius_dump "
