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

