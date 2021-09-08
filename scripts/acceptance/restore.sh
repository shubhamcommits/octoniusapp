#!/bin/bash
# Import Environment Variables
set -o allexport
source .env
set +o allexport

echo " Restore database to host $DESTNATION_HOSTNAME from backup directory /tmp/octonius_dump/octonius/"

mongorestore --host $DESTNATION_HOSTNAME --db=$DBNAME /tmp/octonius_dump/octonius/
