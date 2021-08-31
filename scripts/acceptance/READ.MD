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

