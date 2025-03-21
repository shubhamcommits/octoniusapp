# |  Octonius Client Project

####  Make sure to read all the guidelines before start working


## | Index: 
1. Getting Started
2. Installing and Running the Project
3. Project Structure and Layout
4. Specific Instructions and Information
5. Contribution Rules
6. Testing Configurations
7. CI/CD on Bitbucket Pipelines
8. Build Configurations

---



## 1. Getting Started

**You must have any package manager( `yarn` or `npm` ) installed on your machine**

**[Check here to see how to install yarn](https://yarnpkg.com/lang/en/) - Post installation, hit `yarn -v` to verify the installed version.**

**[Check here to see how to install npm](https://www.npmjs.com/get-npm) - Post installation, hit `npm -v` to verify the installed version.**

**You must have `node.js` any version post(10.0.0) installed on your machine - [check here to see how to install](https://nodejs.org/en/). After installation, hit `node -v` to verify the installed version.**

**You must have `Angular` any version post(8.0.0) installed on your machine - [check here to see how to install](https://cli.angular.io/). After installation, hit `ng --version` to verify the installed version.**



## 2. Installing and Running the Project

*   Hit `npm install` or `yarn install` to install the dependencies for the entire project.
*   Run `npm run start` or `yarn run start` to spin up the application locally at port 4200.
*   Open up the browser and surf to http://localhost:4200.



## 3. Project Structure and Layout

**Till now, the entire project is segregated into multiple applications, and those applications have multiple modules under them working and serving, given below is the entire segmentation of the whole project.**

![Project Structure](OctoniusClientApplicationUML.png?raw=true "Client Project Structure")

### projects/

*   `projects/` folder contains all the sub applications, including `Admin`, `Authentication`, `Groups`, `Myspace`, and, `User`.

### src/

*   `src/` folder is the main application folder, which has `app`, `assets`, `environments`, and `shared` folders.

### src/app

*   `src/app` is the main application folder, and has modules as `dashboard`, and `shared`. It also imports routes from `authentication` module as the lazy loaded module to separate it from the main bundle.

*  And `shared` module is reusable, and can be used in any other module to import its dependencies, features, components, and etc.

*   Also, `dashboard` module imports all the routes from the lazy loaded modules - `admin`, `groups`, `myspace`, and, `user`.

### src/assets

*   `src/assets/` which has the following folders named as `audio`, `fonts`, `images`, and, `scss`. They contains all the static content which we want to serve as the static resources over the network.

### src/environments

*   `src/environments` folder contains all the environments belonging the application. Currently using the standard ones - `dev` and `prod`.

### src/shared

*   `src/shared` folder is the one which includes `config`, `error-handlers`, `guards`, `services`, and, `utilities`.

*   `src/shared/error-handlers` contains the global error handling of both client and server side to ensure that app doesn't breaks.

*   `src/shared/guards` contains `admin-guard`(which ensures, that only admin user shall have global access to all the routes of the application), `authentication-guard`(which ensures, that current user is authenticated and is using valid authentication token), and `routing-guard`(which ensures, that if the application is visited and user is authenticated then it should be routed to default route - we should make it more functional like adding a couple of more usecases).

*   `src/shared/services` contains all the services used in the application.

*   `src/shared/utilities` contains the bundled javascripts modules which are used in the app as the dependency.



## 4. Specific Instructions and Information

*   Try to use Change Detection as `OnPush` at as maximum components as possible in the detection strategy.

*   `src/shared/services/utility-service` contains all the functions which deals with notifications, pop ups, and modals etc.

*   `src/shared/services/storage-service` deals with the cryptoJS library to store content on client-side browser. Example - storing `authToken` in the encrypted form to avoid any kind of issues related to data privacy.

*   `src/shared/services/socket-service` handles all the socket.io functions including `socket.on()`, `socket.emit()` and `socket.disconnect()`.

*   `src/shared/services/error-service` is the global error interceptor, and handles all the client and server default errors to ensure that app doesn't break.

*   `src/app/dashboard/public.functions` contains functions to `getCurrentUser()` and `getCurrentWorkspace()`

        // Import PublicFunctions from class
        import { Injector } from '@angular/core';
        import { PublicFunctions } from 'src/app/dashboard/public.functions';

        // Inject Injector as the dependecy
        constructor(private injector: Injector) { }

        // Make new instance of the class
        publicFunctions = new PublicFunctions(this.injector);



## 5. Contribution Rules

*   Always make an habbit to unsubscribe all the subscriptions using `subsink`.

        // Import SubSink from class
        import { SubSink } from 'subsink';

        // Create Object of SubSink
        public subSink = new SubSink();

        // Adding Subscriptions to the Object
        this.subSink.add(yourSubscriptionHere);

        // Unsubscribing the entire subSink Object at once
        ngOnDestroy(): void {
            this.subSink.unsubscribe();
        }

*   Add trackBy to every `*ngFor`.

        // Import UtilityService as we have trackByIndex function ready
        import { UtilityService } from 'src/shared/services/utility-service/utility.service';

        // Provide the service into constructor
        constructor(public utilityService: UtilityService){}

        // And then in HTML Element
        <element *ngFor="let element of elementsArray; trackBy: utilityService.trackByIndex"></element>
