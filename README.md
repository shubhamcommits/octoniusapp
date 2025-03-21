# |  Octonius App v.8
### ✌️ Welcome to Octonius dev team!   😀  

##  


####  Make sure to read all the guidelines before start working


## | Index: 
1. Installing and Running the Application using Traditional way
2. Installing and Running the Application using Docker
3. Contribution rules
4. Server deployment and run

![Project Structure](OctoniusServicesUML.png?raw=true "Project Structure")

---

## 1. Traditional Way (Recommended for all types of OS)

### **1.1. Installing The App On Your Machine**


1.1.1.      Open the terminal, go to the folder where you want **octonius** repository to be installed and run:
`git clone https://YOUR_USERNAME@bitbucket.org/octonius/octonius.git`

*(replace `YOUR_USERNAME` by your bitbucket username)*

1.1.2.      Go to `octonius/` and run `git checkout master` to ensure you have the updated code.

1.1.3.      Still staying in `octonius/`, run script `./install-dev.sh` to install all the services.

---


### **1.2. Running The App On Your Machine**

##  

**(You must have node.js and npm/yarn installed on your machine - [node.js & npm](https://nodejs.org/en/download/), [yarn](https://classic.yarnpkg.com/en/docs/install))**

**(You must have MongoDB installed on your machine - [mongoDB](https://docs.mongodb.com/manual/installation/))**
  
**(You must have Redis-server install in order to enable caching - [redis](https://redis.io/topics/quickstart))**

---

### _For Linux and MacOS Users_  

* After the installation please check the services list to see the what is the alias name of service installed(for both MongoDB and Redis), in some cases MongoDB is referred as `mongod` and sometimes it is registered as `mongodb`, wherease in the case of Redis it is `redis` or `redis-server`, depending upon the installed version.

* To list services use `brew services list`(for MacOS) or `sudo service --status-all`(for Linux).

* Tap the alias of service name for both MongoDB and Redis Server.

* For reference we are assuming:

      * `alias service name of mongdb = mongoDbService` 

      * `alias service name of redis = redisService`
 
* (`mongoDbService = mongod or mongodb` and `redisService = redis or redis-server`)

##  


1.2.1. Start MongoDB as a service `sudo service mongoDbService start`(For Linux) or `brew services start mongoDbService`(For MacOS)

1.2.2. Start Redis-Server with :

      * `sudo service redisService start` (For Linux)
      * `brew services start redisService`(For MacOS)  
      * If you don't want/need a background service you can just run - `redisService /usr/local/etc/redis.conf`


### _For Windows Users_  


1.2.1. Open the terminal and go to `C:/Program Files/MongoDB/server/[YOUR_SERVER_VERSION]/bin` and run `mongod` or Open the GUI Client for MongoDB which has been installed

1.2.2. Open the terminal and run `redis-server`. For installing redis on windows you can follow the steps here - (https://redislabs.com/blog/redis-on-windows-8-1-and-previous-versions/).


## 

1.2.3. Go to `octonius/` and run `./start-dev.sh` to spin up all the services.


### _For your information_

1.2.4. Run `pm2 ls` to list the services.

1.2.5. Run `pm2 logs` to observe the logs from different services.

---

### 1.3. **Stopping the application on your machine**

1.3.1. Go to `octonius/` and run `./stop-dev.sh`

---


## 2. Using Docker (Only for linux, MacOS, and WSL 2.0 OS users)

### 2.1. **Installing The Docker and Preparing Initial Setup on your machine**


2.1.1.  As a first step install docker - (https://docs.docker.com/install/) and docker compose - (https://docs.docker.com/compose/install/) from the official repositories.

2.1.2.  In your terminal/command line kindly run `docker --version` and `docker-compose --version` to check and verify if the docker is ready to be used in development.

2.1.3.  Close MongoDB as service with the following command `sudo service mongoDbService stop`(For Linux) or `brew services stop mongoDbService`(For MacOS).

2.1.4.  Close Redis as service with the following command `sudo service redisService stop`(For Linux) or `brew services stop redisService`(For MacOS).

---


### 2.2. **Installing The App On Your Machine**


2.2.1	Open the terminal, go to the folder where you want **octonius** repository to be installed and run: `git clone https://YOUR_USERNAME@bitbucket.org/octonius/octonius.git`

2.2.2   Create a folder named `data`(if doesn't exist) under `octonius/` folder along with two sub folders `db` and `uploads`. 

---

### 2.3. **Running the application on your machine**


2.3.1.  Go to `octonius/` and run `docker-compose -p octonius up --build -d` command to serve on `http://localhost:8080`, if it breaks then due to any connectivity/internet issues then modify the command and run `COMPOSE_HTTP_TIMEOUT=300 docker-compose -p octonius up --build -d` and browse to `http://localhost:8080`.

### _For your information_

2.3.2. Run `docker-compose ps` to list the services.

2.3.3. Run `docker-compose logs` to observe the logs from different services.

---

### 2.4. **Stopping the application on your machine**

2.4.1. Go to `octonius/` and run `docker-compose -p octonius down`

---

## 3. Contribution Rules


### Never work on `master` branch!


### Create a new branch for each set of related bugs or set of related tasks, naming by:


####  `type/CapitalizedName`, example: `bugFix/EditPostContent`.


*(**types:** `bugFix`, `feature`)*


**💻 command:** `git checkout -b bugFix/FormatPostContent`


**⚠️ Important: **

*  Before creating a branch, check if someone already started to work on this task and if there's already a branch created for this task, and if there is, **please fetch the branch with the command**:

**💻 command:** `git fetch origin bugFix/FormaPostContent:bugFix/FormatPostContent`

* Right after creating a new branch, push it to remote to make it available for everyone, defining the upstream.

**💻 command:** `git push -u origin bugFix/FormatPostContent`

---

### Everyday BEFORE start working, pull the remote branch updates to your local branch.


**⚠️ Important:** *make sure you're on the correct branch...*

**💻 command:** `git checkout bugFix/FormatPostContent`

*... and run ...*

**💻 command:** `git pull`

---

### Everyday AFTER resume working, push your local branch updates to remote branch.


**⚠️ Important:** *make sure you're on the correct branch...*

**💻 command:** `git checkout bugFix/FormatPostContent`

*... and run ...*

**💻 command:** `git push`

---

### *"... Ok! ... I've finished the task, what now? ..."* 

##  

#### *⚠️ ...Please follow these rules to have your work ready to deploy:*

##  

#### **1. Update your local `master` branch and rebase the branch you was working:**

1.1. Checkout to master:

`git checkout master`

1.2. Pull the updates:

`git pull`

1.3. Checkout to the branch you was working on:

`git checkout bugFix/FormatPostContent`

1.4. Rebase this branch:

`git rebase master`


**⚠️ Important:** 

*If there are more people working on this branch, let them know you're rebasing.*

*Conflicts may occur, and it must be resolved on this branch!*

*The developer is responsible to resolve conflicts and test it on the current branch to make sure the branch is ready and safe to be merged!*

##  


#### **2. Test the app and your work again!**  


#### **3. Go to BitBucket and open a Pull Request, the admin will finish the job!**

---

**⚠️ Important:** 

*Let people know you're opening this pull request.*


**⚠️ Tip:** 

If you finished working on this branch forever, and you've noticed that the branch was  already closed on remote, it makes sense to delete this branch locally:

`git branch -d bugFix/FormatPostContent`


### Are you going back to work on a branch you've created some time ago? Let's make it ready to work again!


#### **1. Make sure your `master` branch is updated:**

`git checkout master`

`git pull`


#### **2. Update this branch you're gonna work (someone could've been working on this branch):**

`git checkout feature/ThatOldFeature`

`git pull`


#### **3. Rebase the branch you're getting back to work:**

`git checkout feature/ThatOldFeature`

`git rebase master`


**⚠️ Important:** 

*If there are more people working on this branch, let them know you're rebasing.*

*Conflicts may occur, and it must be resolved right now, before you get back working on the feature!*


#### **4. Push this updated branch state to remote:**

`git push`

#### *... and then you're good to go!*

---

### If you are going to create a new service 

---


## 4. Server Deployment And Run

###### *This part is only for server admins, you must have server credentials, conact your superior if you're not sure if it is one of your duties.*


#### 4.1.	Accessing The Server

On terminal, run the command `ssh ubuntu@86.120.164.146` and fill in the password.

*(Use the command `exit` to quit the ssh session )*

#### 4.2.   Deploying the containers(Docker-Compose Method)

4.2.1. Go to `/home/ubuntu/octonius` and run the following commands:

*   Run script `./deploy-compose.sh`.

4.2.2. Check the status of docker containers `docker-compose ps`, you should see all the 15 services up and running.

4.2.3. In order to stop the containers, simply run `./stop-compose.sh`.

#### 4.3.   Deploying the Stack(Docker Swarm Method)

4.3.1.  Go to `/home/ubuntu/octonius` and run the following commands:

* Run `./deploy-swarm.sh` script - this will do everything from start to end.

* Check the status of stack and services via the following:

      * `docker stack ls`

      * `docker service ls` and make sure that all the replicas are up and running.

4.3.2. In order to stop the stack, simply run `./stop-swarm.sh`.

#### 4.4.   Some of the Important Commands

* To check the running containers - `docker container ls`

* To check the running tasks - `docker container ps`

* To list the running services - `docker service ls`

* To list the running stacks - `docker stack ls`

* To list all the images - `docker image ls`

* To list all the volumes - `docker volume ls`

* To list all the network - `docker network ls`

* To leave the swarm - `docker swarm leave -f`

* To stop all the containers - `docker container stop $(docker container ls -aq)`

* To remove all the stopped containers - `docker container rm $(docker container ls -aq)`

* To remove all the images - `docker image rm $(docker image ls -aq)`

* To remove all the volumes - `docker volume rm $(docker volume ls -q)`

* To remove all the network - `docker network rm $(docker network ls -q)`

* To remove everything or clean up the system - `docker system prune -f -a --volumes`

sudo chown -R $USER:$(id -gn $USER) directory - `To make the user as a the owner with all the permissions`

scp -r ubuntu@86.120.164.146:/home/ubuntu/dailybackup/db $PWD/data/ - `To clone the database into local machine`


### *The following sections below, have been deprecated and they are not in active state for production purposes, however if something needs to be debugged and checked then you may use the following steps(Not recommended).*


#### x.x.	Running The App On Server

x.x.1.	To serve the App, go to `/home/ubuntu/` folder and run the command `pm2 run ecosystem.config.js`.

x.x.2.	To **check** if the App process is running, use the command: `pm2 status`.

x.x.3.	To **stop** the serving the App, use the command: `pm2 stop ecosystem.config.js`.

x.x.4.	To **restart** the App, **refreshing** environment updates after changing `ecosystem.config.js` file, use the command: `pm2 restart ecosystem.config.js --env production --update-env`.

x.x.5.	To **turn on live logs** on the server process, use the command `pm2 logs —format`. *(hit **`CTRL`** + **`C`** to stop it)*


#### x.x. Deploying On Server

x.x.1	At `/home/ubuntu/` folder, stop the server process with the command `pm2 stop ecosystem.config.js`.

x.x.2.	Save the current App state on the server going to  `/home/ubuntu/octonius`, and running the command `sudo git stash`.

x.x.3.	At  `/home/ubuntu/octonius` folder, pull the App changes from the repo: `sudo git pull`.

x.x.4.	At  `/home/ubuntu/octonius/api/` folder,  run `npm install`.

x.x.5.	Go to  `/home/ubuntu/octonius/client/` folder, and run `npm install`.

x.x.6.	At  `/home/ubuntu/octonius/client/` folder, run `ng build --prod`.

x.x.7.	Go to  `/home/ubuntu/` folder, and start the serving the App again with the command `pm2 start ecosystem.config.js`.


---

