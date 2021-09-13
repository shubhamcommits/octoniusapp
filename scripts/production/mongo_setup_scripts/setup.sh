#!/bin/bash

MONGODB1=mongo-0-mongo
MONGODB2=mongo-1-mongo
MONGODB3=mongo-2-mongo
echo "**********************************************" ${MONGODB1}
echo "Waiting for startup.."
until curl http://${MONGODB1}:27017/serverStatus\?text\=1 2>&1 | grep uptime | head -1; do
  printf '.'
  sleep 1
done
sleep 10
# echo curl http://${MONGODB1}:28017/serverStatus\?text\=1 2>&1 | grep uptime | head -1
# echo "Started.."


echo SETUP.sh time now: `date +"%T" `
mongo --host $MONGODB1:27017 << EOF
var cfg = {
    "_id": "prod_octo_rs",
    "protocolVersion": 1,
    "version": 1,
    "members": [
        {
            "_id": 0,
            "host": "mongo-0-mongo:27017",
            "priority": 2
        },
        {
            "_id": 1,
            "host": "mongo-1-mongo:27017",
            "priority": 0
        },
        {
            "_id": 2,
            "host": "mongo-2-mongo:27017",
            "priority": 0
        }
    ],settings: {chainingAllowed: true}
};
rs.initiate(cfg, { force: true });
rs.reconfig(cfg, { force: true });
rs.slaveOk();
rs.secondaryOk();
db.getMongo().setReadPref('nearest');
db.getMongo().setSlaveOk();
rs.status();
EOF
