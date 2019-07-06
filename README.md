# |  Octonius App
### ✌️ Welcome to Octonius dev team!  😀  

##  


####  Make sure to read all the guidelines before start working


## | Index: 
1. Installing and Running the Application using Traditional way
2. Installing and Running the Application using Docker
3. Contribution rules
4. Server deployment and run

---

## 1. Traditional Way (Recommended for all types of OS)

### 1.1. Installing The App On Your Machine


1.1.1	Open the terminal, go to the folder where you want **octonius** repository to be installed and run:
`git clone https://YOUR_USERNAME@bitbucket.org/octonius/octonius.git`

*(replace `YOUR_USERNAME` by your bitbucket username)*

1.1.2.	Go to `octonius/api/` folder and run `npm install` or `yarn`.

1.1.3.  Install Nodemon(https://github.com/remy/nodemon) globally in your machine `npm install -g nodemon` or `yarn add global nodemon`.

1.1.4.	Go to `octonius/client/` folder and run `npm install` or `yarn`.

1.1.5.	Still in `octonius/client/` folder, run `ng build`.

---


### 1.2. Running The App On Your Machine

### _For Linux and MacOS Users_  


**(You must have MongoDB installed on your machine, [check here to see how to install](https://docs.mongodb.com/manual/installation/))**
  
**(Along with Redis-server to enable caching - [chech here to see how to install](https://redis.io/topics/quickstart))**

**After the installation please check the services list to see the what is the alias name of service installed(for both MongoDB and Redis), in some cases MongoDB is referred as `mongod` and sometimes it is registered as `mongodb`, wherease in the case of Redis it is `redis` or `redis-server`, depending upon the installed version.**

**To list services use `brew services list`(for MacOS) or `sudo service --status-all`(for Linux).**

**Record the alias of service name for both MongoDB and Redis Server.**

**For reference we are assuming:**

* `alias service name of mongdb = mongoDbService` 

* `alias service name of redis = redisService`
 
**(`mongoDbService = mongod or mongodb` and `redisService = redis or redis-server`)**

##  


1.2.1. Start MongoDB as a service `sudo service mongoDbService start`(For Linux) or `brew services start mongoDbService`(For MacOS)

1.2.2. Start Redis-Server with `redisService` or `redisService /usr/local/etc/redis.conf`

#### OR

1.2.2. Start Redis-Server as a service `sudo service redisService start`(For Linux) or `brew services start redisService`(For MacOS).


#### Please Ensure that while pushing make sure that you change the environment variables back to the previous state.

---

### _For Windows Users_  


1.2.1. Open the terminal and go to `C:/Program Files/MongoDB/server/4.0/bin` and run `mongod` or Open the GUI Client for MongoDB which has been installed

1.2.2. Open the terminal and run `redis-server`. For installing redis on windows you can follow the step here - (https://redislabs.com/blog/redis-on-windows-8-1-and-previous-versions/).

---

1.2.3. Go to `api/development.config.js` change the environment variables of the following:

*  `process.env.dbURL = 'mongodb://mongodb:27017/octonius'` to `process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius'`.

*  `process.env.REDIS_HOST = 'redis'` to ` process.env.REDIS_HOST = '127.0.0.1'`.

1.2.4. Go to `client/src/environments/environment.hmr.ts` and change the `REAL_TIME_URL: 'localhost:3000/editor'` to `REAL_TIME_URL: 'localhost:3001'`.

##  



1.2.5.	Go to `octonius/api/` folder and run `npm run dev` or `yarn run dev` or `nodemon server`  command.

1.2.6. Go to `octonius/client/` folder and run `ng serve --configuration hmr`  command to serve on `localhost:4200` and make your app live reload while developing, octonius development team uses **_HOT MODULE REPLACEMENT_** to our repositories [check here to see how it works (https://codinglatte.com/amp/posts/angular/enabling-hot-module-replacement-angular-6/)].(Preferred)

#### OR

1.2.7.	Go to `octonius/client/` folder and run `ng build`  command to serve on `localhost:3000`.

---


## 2. Using Docker (Only for linux, MacOS, and WSL 2.0 OS users)

### 2.1. Installing The Docker and Preparing Initial Setup on your machine


2.1.1.  As a first step install docker[check here to see how to install(https://docs.docker.com/install/)] and docker compose[check here to see how to install(https://docs.docker.com/compose/install/)] from the official repositories.

2.1.2.  In your terminal/command line kindly run `docker --version` and `docker-compose --version` to check and verify if the docker is ready to be used in development.

2.1.3.  Close MongoDB as service with the following command `sudo service mongoDbService stop`(For Linux) or `brew services stop mongoDbService`(For MacOS).

2.1.4.  Close Redis as service with the following command `sudo service redisService stop`(For Linux) or `brew services stop redisService`(For MacOS).

---


### 2.2. Installing The App On Your Machine


2.2.1	Open the terminal, go to the folder where you want **octonius** repository to be installed and run: `git clone https://YOUR_USERNAME@bitbucket.org/octonius/octonius.git`

2.2.2   Create a folder named `data`(if doesn't exist) under `octonius/` folder along with two sub folders `db` and `uploads`. 

---

## 2.3. Running The App On Your Machine


2.3.1.  Go to `octonius/` folder and run `docker-compose up --build` command to serve on `localhost:3000`, if it breaks then due to any connectivity/internet issues then modify the command and run `COMPOSE_HTTP_TIMEOUT=300 docker-compose up --build` and browse to `localhost:3000`.

---

## 3. Contribution Rules


### ✔️ Never work on `master` branch!


### ✔️ Create a new branch for each set of related bugs or set of related tasks, naming by:


####  `type_CapitalizedName`, example: `bugfix_EditPostContent`.


*(**types:** `bugfix`, `feature`)*


**💻 command:** `git checkout -b bugfix_FormatPostContent`


**⚠️ Important: **

*  Before creating a branch, check if someone already started to work on this task and if there's already a branch created for this task, and if there is, **please fetch the branch with the command**:

**💻 command:** `git fetch origin bugfix_FormaPostContent:bugfix_FormatPostContent`

* Right after creating a new branch, push it to remote to make it available for everyone, defining the upstream.

**💻 command:** `git push -u origin bugfix_FormatPostContent`


### ✔️ Everyday BEFORE start working, pull the remote branch updates to your local branch.


**⚠️ Important:** *make sure you're on the correct branch...*

**💻 command:** `git checkout bugfix_FormatPostContent`

*... and run ...*

**💻 command:** `git pull`


### ✔️ Everyday AFTER resume working, push your local branch updates to remote branch.


**⚠️ Important:** *make sure you're on the correct branch...*

**💻 command:** `git checkout bugfix_FormatPostContent`

*... and run ...*

**💻 command:** `git push`


### ✔️ *"... Ok! ... I've finished the task, what now? ..."* 

##  

#### *⚠️ ...Please follow these rules to have your work ready to deploy:*

##  

#### *1. Update your local `master` branch and rebase the branch you was working:*

1.1. Checkout to master:

`git checkout master`

1.2. Pull the updates:

`git pull`

1.3. Checkout to the branch you was working on:

`git checkout bugfix_FormatPostContent`

1.4. Rebase this branch:

`git rebase master`


**⚠️ Important:** 

*If there's more people working on this branch, let them know you're rebasing.*

*Conflicts may occur, and it must be resolved on this branch!*

*The developer is responsible to resolve conflicts and test it on the current branch to make sure the branch is ready and safe to be merged!*

##  


#### 2. Test the app and your work again!

##  


#### 3. Go to BitBucket and open a Pull Request, the admin will finish the job!


**⚠️ Important:** 

*Let people know you're opening this pull request.*


**⚠️ Tip:** 

If you finished working on this branch forever, and you've noticed that the branch was  already closed on remote, it makes sense to delete this branch locally:

`git branch -d bugfix_FormatPostContent`


### ✔️ Are you going back to work on a branch you've created some time ago? Let's make it ready to work again!


#### 1. Make sure your `master` branch is updated:

`git checkout master`

`git pull`


#### 2. Update this branch you're gonna work (someone could've been working on this branch):

`git checkout feature_ThatOldFeature`

`git pull`


#### 3. Rebase the branch you're getting back to work:

`git checkout feature_ThatOldFeature`

`git rebase master`


**⚠️ Important:** 

*If there's more people working on this branch, let them know you're rebasing.*

*Conflicts may occur, and it must be resolved right now, before you get back working on the feature!*


#### 4. Push this updated branch state to remote:

`git push`

#### *... and then you're good to go!*

---


## 4. Server Deployment And Run

###### *This part is only for server admins, you must have server credentials, conact your superior if you're not sure if it is one of your duties.*


#### 4.1.	Accessing The Server

On terminal, run the command `ssh ubuntu@86.122.94.224` and fill in the password.

*(Use the command `exit` to quit the ssh session )*

#### 4.2.   Deploying the containers

4.2.1. Go to `/home/ubuntu/octonius` and run the following commands:

*  `docker-compose -f docker-compose.local.yml pull`

*   `docker-compose -f docker-compose.local.yml up -d`

4.2.2. Check the status of docker containers `docker container ps -a`, you should see all the 5 containers running named as `octonius_nginx_1`, `octonius_client_1`, `octonius_api_1`, `octonius_mongodb_1`, and `octonius_redis_1`.


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

