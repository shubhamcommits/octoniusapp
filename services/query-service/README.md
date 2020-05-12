
### Query Service
Connects to Apache Solr 7.7.1, an open source ready to deploy enterprise full-text search engine, for indexing and querying

####  Make sure to read all the guidelines before start working
## | Index: 
1. Local setup
2. Steps to follow for building and running the application
3. Contribution Rules
4. Server deployment and run

---

## 1. Local Setup
    Java 11 or higher JDK
    IDE with Lombok support
    Maven 3
    Docker & docker-compose

### 1.1. Check if you have installed Java 11 or higher JDK

1.1.1	Open the terminal, and run:
`java -version`
---

1.1.2.	If you do not have Java 11 or higher JDK installed, then download it using the link below:
`https://www.oracle.com/technetwork/java/javase/downloads/jdk11-downloads-5066655.html`

---
### 1.2. Check if you have Lombok support in your IDE

1.2.1	Search and install the Lombok plugin in your IDE:
`File/Settings/Pluggins`

---
### 1.3. Check if you have Maven 3 available in your local machine

1.3.1	Open the terminal, and run:
`mvn -version`
---

1.3.2.	If you do not have maven installed use the link below to download it:
`wget http://www-eu.apache.org/dist/maven/maven-3/3.3.9/binaries/apache-maven-3.3.9-bin.tar.gz`

---

### 1.4. Installing The Docker

1.4.1.  As a first step install docker[check here to see how to install(https://docs.docker.com/install/)] and docker compose[check here to see how to install(https://docs.docker.com/compose/install/)] from the official repositories.

---

1.4.2.  In your terminal/command line kindly run `docker --version` and `docker-compose --version` to check and verify if the docker is ready to be used in development.

---

## 2. Steps to follow for building and running the application

### 2.1. Cloning the repository

2.1.1	Open the terminal, go to the folder where you want **query-service** repository to be installed and run: 
`git clone https://YOUR_USERNAME@bitbucket.org/octonius/query-service.git`

---

### 2.2. Installing & Running The App On Your Machine

2.2.1	 Go to `octonius/query-service` folder and run `docker-compose up` command to serve Apache SOLR on `localhost:8983`, 
and browse to `localhost:8983`.

---

2.2.2	 Go to `octonius/query-service` folder and run `mvn clean install` for generating a target 

---

2.2.3	 Go to `octonius/query-service` folder and run `mvn spring-boot:run` for running the spring-boot app,
 and brouse to  `http://localhost:8080/api/query-service/swagger-ui.html` for accessing the Swagger documentation

---

2.2.4 In Swagger UI you will be able to search users and post entities by the following query request:

`{
   "conditions": [
     {
       "columnName": "string",
       "conditionOperator": "EQUAL",
       "value": {}
     }
   ],
   "sortList": [
     {
       "columnName": "string",
       "sortDirection": "desc"
     }
   ]
 }`
 
 - specify the `columnName` where you want to apply the search. For Users you can choose as a column name between: 
 username, fullName, email, active and userSkills and for Posts you can choose between: title, content and attachedTags
 
 -  specify the `conditionOperator` that you want to apply during the search process. You can choose between:
    `EQUAL, STARTS_WITH, CONTAINS, CONTAINS_WORDS`
    
 -  fill the `value` with the word/words that you want to search for, ex: "value": "Dan"
 
 -  in the sorting list you can provide a column for sorting ASC or DESC the results
 
---

### 2.3. Cleanup

2.3.1	 Go to `octonius/query-service` folder and run the following commands for stopping and deleting all docker
containers on your local machine
` docker-compose rm -svf` 
` docker stop $(docker container ls -aq)` 
` docker container rm $(docker container ls -aq)` 

---

## 3. Contribution Rules

### ✔️ Never work on `master` branch!

### ✔️ Create a new branch for each set of related bugs or set of related tasks, naming by:

### ✔️ Everyday BEFORE start working, pull the remote branch updates to your local branch.

### ✔️ Everyday AFTER resume working, push your local branch updates to remote branch.

### ✔️ *"... Ok! ... I've finished the task, what now? ..."* 

### ✔ Go to BitBucket and open a Pull Request, the admin will finish the job!

---

## 4. Server Deployment And Run

###### *This part is only for server admins, you must have server credentials, contact your superior if you're not sure if it is one of your duties.*

---
4.1.	Accessing The Google Cloud Project Cluster

4.1.1	 Open your terminal and install GCK using the following steps:
         
         https://cloud.google.com/sdk/docs/downloads-apt-get
---

4.1.2	 Set-up the google cloud project, as a default project:
         
        gcloud config set project octonius-workplace-server
---

4.1.3	 Configuring cluster access for kubectl:
         
        Kubernetes uses a YAML file called kubeconfig to store cluster authentication information for kubectl. 
        kubeconfig contains a list of contexts to which kubectl refers when running commands. 
        By default, the file is saved at $HOME/.kube/config.
        
        gcloud container clusters get-credentials octonius-production-cluster

---

4.1.4	 Get all service & clusters info
         
        kubectl get all
        
        In the project there are three kubernetes config files: 
            - one for query-service-production environment (located at: /kubernetes/query-service-production.yml)
            - one for solr persistent volume claim (located at: /solr/kubernetes/production/solrPersistentVolumeClaim.yaml)
            - one for solr service (located at: solr/kubernetes/production/solr.yaml)
             
---

4.1.5	 For setting up a new service use the following command:
         
        kubectl apply -f [new-service-config-file.yml]
        
        If we want to pool an image from a private repository, then use this command to create a secret:
        
        kubectl create secret docker-registry dockersecret --docker-server=https://index.docker.io 
        --docker-username=<username> --docker-password=<pass> --docker-email=dev@octonius.com

        
        For reading/using your base64 encoded secret in .yaml format, please use this command:
        
        kubectl get secret regcred --output=yaml
        
        
---


