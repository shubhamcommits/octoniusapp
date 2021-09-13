# Deployment of Solution on Production
```

## clone the octonius repo for development develop 
git clone git clone https://bitbucket.org/octonius/octonius.git -b develop
```
```
cd octonius/scripts/productions


docker login 
source .env
```
```
./deploy-octonius-prod.sh
```
this will deploy entire solution with mongo db cluster and replica set configuraiton .


## For Backup and restore run following command

# Backup
```
mongodump --host mongo-0-mongo:27017 --forceTableScan --db=octonius --out=/tmp/prod_octonius_dump

where --host = host of the source database server and --db=source database .

```

# Restore
```
mongorestore --host mongo-0-mongo:27017 --db=test /tmp/prod_octonius_dump/octonius/

where --host = host on which you want to restore the this backup and --db= name of the DB on which you want to restore this database backup 
```
## if it is fresh deployment then following steps should be execuited
```
step-1) copy the following provided by octonious to your home directory or any directory of your choice
 files-list: 
           1) deploy-octonius-prod.sh ( for prod deployment )
           2) .env
           3) deploy-octonius-prod.yaml
           4) stop-octonius-prod.sh
           5) mongo_setup_scripts ( folder container setup.sh so provide this entire folder as it is needed )

Step-2 add entry in /etc/host file to connect to mongodb server from host machine
     vi /etc/hosts
     and add following entry 
                    127.0.0.1 localhost mongo-0-mongo mongo-1-mongo mongo-2-mongo
     and save it 

step-3) ./deploy-octonius-prod.sh
```
## If deployment is for client or existing client with our setup
```
in .env file there is environment variable for DB host to back and connection string. following are the variable that are needed to be change according to our setup. before performing any mingraiton of updates.

# database operations
HOSTNAME=localhost:27017 ( exiting mongodb host from which you want to take a backup )
DESTNATION_HOSTNAME=mongo-0.mongo:27017  ( mongo db host name on which you want to restore database you backup )
DBNAME=octonius ( database name which you want to backup and restore )

step-1) copy the following provided by octonious to your home directory or any directory of your choice
 files-list:
           1) deploy-octonious-prod.sh ( for prod deployment )
           2) .env
           3) prod_backup.sh
           4) deploy-octonius-prod.yml
           5) prod_restore.sh
           6) stop-octonius-prod.sh
           7) mongo_setup_scripts ( folder container setup.sh so provide this entire folder as it is needed )

step-2) go to the directory where you have store this above files and folder

step-3) prod_backup.sh = ( for backing up the existing mongodb database )

step-5) add entry in /etc/host file to connect to mongodb server from host machine
     vi /etc/hosts
     and add following entry
                    127.0.0.1 localhost mongo-0-mongo mongo-1-mongo mongo-2-mongo
     and save it

step-6) prod_restore.sh = ( for restoring the backup database that we done in step 3 to the mongodb replicaset cluster )
```
