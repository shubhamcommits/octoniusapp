# |  Octonius App
### ✌️ Welcome to Octonius dev team!  😀


##### 👓 📖  Make sure to read all the guidelines before start working  📖 👓

'


## | Index: 

1. Installing the app on your machine
2. Running the app on your machine
3. Contribution rules
4. Server deployment and run
---

'


## 1. Installing The App On Your Machine

'

1.1.	Open the terminal, go to the folder where you want **octonius** repository to be installed and run:
`git clone https://YOUR_USERNAME@bitbucket.org/octonius/octonius.git`

*(replace `YOUR_USERNAME` by your bitbucket username)*

1.2.	Go to `octonius/` folder and run `npm install`.

1.3.	Go to `octonius/public/` folder and run `npm install`.

1.4.	Still in `octonius/public/` folder, run `ng build`.

1.5.	Open `octonius/app.js` file and uncomment **line 19** were it requires the `nodemon_config` file to be used by nodemon to run development environment: 

```javascript
/*	ATTENTION:
 *	This change is only to make the app run locally,
 *  this change should never be added and comitted
 *	to production.
 */

// The line below must be uncommented to run the app locally

require('./nodemon_config');

```

---

'

## 2. Running The App On Your Machine

###### (You must have MongoDB installed on your machine, [check here to see how to install](https://docs.mongodb.com/manual/installation/).) 

'

2.1.	Start MongoDB with `mongod` command or, `mongod --dbpath PATH_TO_YOUR_DATA_DB_FOLDER` passing the path to default MongoDB data folder.

2.2.	Go to `octonius/` folder and run `nodemon server.js`  command.

2.3.	Open your browser and go to `localhost:3000`.

---

'

## 3. Contribution Rules

'

### ✔️ Never work on `master` branch!

'

### ✔️ Create a new branch for each set of related bugs or set of related tasks, naming by:

####  `type_CapitalizedName`, example: `bugfix_EditPostContent`.

'

*(**types:** `bugfix`, `feature`)*

'

**💻 *command:*** `git checkout -b bugfix_FormatPostContent`

'

**⚠️ Important: **

* Before creating a branch, check if someone already started to work on this task and if there's already a branch created for this task, and if there is, **please fetch the branch with the command**:

  **💻 *command:*** `git fetch origin bugfix_FormaPostContent:bugfix_FormatPostContent`

* Right after creating a new branch, push it to remote to make it available for everyone, defining the upstream.

  **💻 *command:*** `git push -u origin bugfix_FormatPostContent`

'

### ✔️ Everyday BEFORE start working, pull the remote branch updates to your local branch.

'

**⚠️ Important:** *make sure you're on the correct branch...*

**💻 *command:*** `git checkout bugfix_FormatPostContent`

*... and run ...*

**💻 *command:*** `git pull`

'

### ✔️ Everyday AFTER resume working, push your local branch updates to remote branch.

'

**⚠️ Important:** *make sure you're on the correct branch...*

**💻 *command:*** `git checkout bugfix_FormatPostContent`

*... and run ...*

**💻 *command:*** `git push`

'

### ✔️ *"... Ok! ... I've finished the task, what now? ..."* 

'

##### *...Please follow these rules to have your work ready to deploy:*

'

##### **1. Update your local `master` branch and rebase the branch you was working:**

1.1. Checkout to master:

`git checkout master`

1.2. Pull the updates:

`git pull`

1.3. Checkout to the branch you was working on:

`git checkout bugfix_FormatPostContent`

1.4. Rebase this branch:

`git rebase master`

'

**⚠️ Important:** 

*If there's more people working on this branch, let them know you're rebasing.*

*Conflicts may occur, and it must be resolved on this branch!*

*The developer is responsible to resolve conflicts and test it on the current branch to make sure the branch is ready and safe to be merged!*

'

##### **2. Test the app and your work again!**

'

##### 3. Go to BitBucket and open a Pull Request, the admin will finish the job!

'

**⚠️ Important:** 

*Let people know you're opening this pull request.*

'

**⚠️ Tip:** 

If you finished working on this branch forever, and you've noticed that the branch was  already closed on remote, it makes sense to delete this branch locally:

`git branch -d bugfix_FormatPostContent`

'

### ✔️ Are you going back to work on a branch you've created some time ago? Let's make it ready to work again!

'

##### 1. Make sure your `master` branch is updated:

`git checkout master`

`git pull`

'

##### 2. Update this branch you're gonna work (someone could've been working on this branch):

`git checkout feature_ThatOldFeature`

`git pull`

'

##### 3. Rebase the branch you're getting back to work:

`git checkout feature_ThatOldFeature`

`git rebase master`

'

**⚠️ Important:** 

*If there's more people working on this branch, let them know you're rebasing.*

*Conflicts may occur, and it must be resolved right now, before you get back working on the feature!*

'

##### 4. Push this updated branch state to remote:

`git push`

##### *... and then you're good to go!*

---

'

## 4. Server Deployment And Run

###### *This part is only for server admins, you must have server credentials, conact your superior if you're not sure if it is one of your duties.*

'

#### 4.1.	Accessing The Server

On terminal, run the command `ssh ubuntu@86.122.94.224` and fill in the password.

*(Use the command `exit` to quit the ssh session )*

'

#### 4.2.	Running The App On Server

4.2.1.	To serve the App, go to `/home/ubuntu/` folder and run the command `pm2 run ecosystem.config.js`.

4.2.2.	To **check** if the App process is running, use the command: `pm2 status`.

4.2.3.	To **stop** the serving the App, use the command: `pm2 stop ecosystem.config.js`.

4.2.4.	To **restart** the App, **refreshing** environment updates after changing `ecosystem.config.js` file, use the command: `pm2 restart ecosystem.config.js --env production --update-env`.

4.2.5.	To **turn on live logs** on the server process, use the command `pm2 logs —format`. *(hit **`CTRL`** + **`C`** to stop it)*

'

#### 4.3. Deploying On Server

4.3.1	At `/home/ubuntu/` folder, stop the server process with the command `pm2 stop ecosystem.config.js`.

4.3.2.	Save the current App state on the server going to  `/home/ubuntu/octonius`, and running the command `sudo git stash`.

4.3.3.	At  `/home/ubuntu/octonius` folder, pull the App changes from the repo: `sudo git pull`.

4.3.4.	At  `/home/ubuntu/octonius` folder,  run `npm install`.

4.3.5.	Go to  `/home/ubuntu/octonius/public/` folder, and run `npm install`.

4.3.6.	At  `/home/ubuntu/octonius/public/` folder, run `ng build --prod`.

4.3.7.	Go to  `/home/ubuntu/` folder, and start the serving the App again with the command `pm2 start ecosystem.config.js`.

'

---

