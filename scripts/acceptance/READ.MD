# Deployment of Solution
```

## clone the octonius repo for development develop 
git clone git clone https://bitbucket.org/octonius/octonius.git -b develop
```
```
cd octonius/scripts/acceptance


docker login 
source .env
```
```
./deploy-octonius-acc.sh
```
this will deploy entire solution with mongo db cluster and replica set configuraiton .


## For Backup and restore run following command

# Backup
```
mongodump --host mongo-0.mongo:27017 --forceTableScan --db=octonius --out=/tmp/octonius_dump

where --host = host of the source database server and --db=source database .

```

# Restore
```
mongorestore --host mongo-0.mongo:27017 --db=test /tmp/octonius_dump/octonius/

where --host = host on which you want to restore the this backup and --db= name of the DB on which you want to restore this database backup 
```
## if it is fresh deployment then following steps should be execuited
```
step-1) git clone git clone https://bitbucket.org/octonius/octonius.git -b develop
step-2) cd octonius/scripts/acceptance
step-3) docker login
step-4) ./deploy-octonius-acc.sh
```
## If deployment is for client or existing client with our setup
```
step-1) git clone git clone https://bitbucket.org/octonius/octonius.git -b develop
step-2) cd octonius/scripts/acceptance
step-3) backup.sh =( for backing up the existing mongodb database )
step-4) docker login
step-5) ./deploy-octonius-acc.sh
step-6) restore.sh = ( for restoring the backup database that we done in step 3 to the mongodb replicaset cluster )
```
