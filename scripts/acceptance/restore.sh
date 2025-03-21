#!/bin/bash
# Import Environment Variables
set -o allexport
source .env
set +o allexport

echo " Restore database to host $DESTNATION_HOSTNAME from backup directory /tmp/octonius_dump/octonius/"

mongorestore --host $DESTNATION_HOSTNAME --db=$DBNAME /tmp/octonius_dump/octonius/
#mongorestore --sslAllowInvalidCertificates -d octonius --uri "mongodb+srv://doadmin:t0EjP63wc178V24a@db-octonius-fra-0fe07ab5.mongo.ondigitalocean.com/octonius?authSource=admin&replicaSet=db-octonius-fra&tls=true&tlsCAFile=./ca-certificate.crt" ./tmp/octonius_dump/octonius
#mongo "mongodb+srv://octonius:71n48Ppk3Ut0K26m@db-octonius-fra-0fe07ab5.mongo.ondigitalocean.com/octonius?authSource=admin&replicaSet=db-octonius-fra"
