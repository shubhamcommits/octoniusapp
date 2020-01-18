# |  DOCS - Octonius REST API
'

###### Status reference:

*❗️❗️ - Waiting backend and frontend implementation*

*❗️ - Backend ready, waiting frontend implementation*

'

## | Index: 

1. **Getting Started**
1. **`api/auths` routes**
2. **`api/files` routes**
3. **`api/groups` routes**
4. **`api/posts` routes**
5. **`api/users` routes**
6. **`api/workspaces` routes**
---

'

## | 1. Getting Started

1) Terminologies
The following are the most important terms related to REST APIs

Resource is an object or representation of something, which has some associated data with it and there can be set of methods to operate on it. E.g. Animals, schools and employees are resources and delete, add, update are the operations to be performed on these resources.
Collections are set of resources, e.g Companies is the collection of Company resource.
URL (Uniform Resource Locator) is a path through which a resource can be located and some actions can be performed on it.
2) API endpoint
Let’s write few APIs for Companies which has some Employees, to understand more.
/getAllEmployees is an API which will respond with the list of employees. Few more APIs around a Company will look like as follows:

/addNewEmployee
/updateEmployee
/deleteEmployee
/deleteAllEmployees
/promoteEmployee
/promoteAllEmployees
And there will be tons of other API endpoints like these for different operations. All of those will contain many redundant actions. Hence, all these API endpoints would be burdensome to maintain, when API count increases.

What is wrong?
The URL should only contain resources(nouns) not actions or verbs. The API path/addNewEmployee contains the action addNew along with the resource name Employee.

Then what is the correct way?
/companies endpoint is a good example, which contains no action. But the question is how do we tell the server about the actions to be performed on companies resource viz. whether to add, delete or update?

This is where the HTTP methods (GET, POST, DELETE, PUT), also called as verbs, play the role.

The resource should always be plural in the API endpoint and if we want to access one instance of the resource, we can always pass the id in the URL.

method GET path /companies should get the list of all companies
method GET path /companies/34 should get the detail of company 34
method DELETE path /companies/34 should delete company 34
In few other use cases, if we have resources under a resource, e.g Employees of a Company, then few of the sample API endpoints would be:

GET /companies/3/employees should get the list of all employees from company 3
GET /companies/3/employees/45 should get the details of employee 45, which belongs to company 3
DELETE /companies/3/employees/45 should delete employee 45, which belongs to company 3
POST /companies should create a new company and return the details of the new company created
Isn’t the APIs are now more precise and consistent? 😎

Conclusion: The paths should contain the plural form of resources and the HTTP method should define the kind of action to be performed on the resource.

3) HTTP methods (verbs)
HTTP has defined few sets of methods which indicates the type of action to be performed on the resources.

The URL is a sentence, where resources are nouns and HTTP methods are verbs.
The important HTTP methods are as follows:

GET method requests data from the resource and should not produce any side effect.
E.g /companies/3/employees returns list of all employees from company 3.
POST method requests the server to create a resource in the database, mostly when a web form is submitted.
E.g /companies/3/employees creates a new Employee of company 3. 
POST is non-idempotent which means multiple requests will have different effects.
PUT method requests the server to update resource or create the resource, if it doesn’t exist.
E.g. /companies/3/employees/john will request the server to update, or create if doesn’t exist, the john resource in employees collection under company 3.
PUT is idempotent which means multiple requests will have the same effects.
DELETE method requests that the resources, or its instance, should be removed from the database.
E.g /companies/3/employees/john/ will request the server to delete john resource from the employees collection under the company 3.
There are few other methods which we will discuss in another post.

4) HTTP response status codes
When the client raises a request to the server through an API, the client should know the feedback, whether it failed, passed or the request was wrong. HTTP status codes are bunch of standardized codes which has various explanations in various scenarios. The server should always return the right status code.
The following are the important categorization of HTTP codes:

2xx (Success category)
These status codes represent that the requested action was received and successfully processed by the server.

200 Ok The standard HTTP response representing success for GET, PUT or POST.
201 Created This status code should be returned whenever the new instance is created. E.g on creating a new instance, using POST method, should always return 201 status code.
204 No Content represents the request is successfully processed, but has not returned any content.
DELETE can be a good example of this.
The API DELETE /companies/43/employees/2 will delete the employee 2 and in return we do not need any data in the response body of the API, as we explicitly asked the system to delete. If there is any error, like if employee 2 does not exist in the database, then the response code would be not be of 2xx Success Category but around 4xx Client Error category.
3xx (Redirection Category)
304 Not Modified indicates that the client has the response already in its cache. And hence there is no need to transfer the same data again.
4xx (Client Error Category)
These status codes represent that the client has raised a faulty request.

400 Bad Request indicates that the request by the client was not processed, as the server could not understand what the client is asking for.
401 Unauthorized indicates that the client is not allowed to access resources, and should re-request with the required credentials.
403 Forbidden indicates that the request is valid and the client is authenticated, but the client is not allowed access the page or resource for any reason. E.g sometimes the authorized client is not allowed to access the directory on the server.
404 Not Found indicates that the requested resource is not available now.
410 Gone indicates that the requested resource is no longer available which has been intentionally moved.
5xx (Server Error Category)
500 Internal Server Error indicates that the request is valid, but the server is totally confused and the server is asked to serve some unexpected condition.
503 Service Unavailable indicates that the server is down or unavailable to receive and process the request. Mostly if the server is undergoing maintenance.
5) Field name casing convention
You can follow any casing convention, but make sure it is consistent across the application. If the request body or response type is JSON then please follow camelCase to maintain the consistency.

6) Searching, sorting, filtering and pagination
All of these actions are simply the query on one dataset. There will be no new set of APIs to handle these actions. We need to append the query params with the GET method API.
Let’s understand with few examples how to implement these actions.

Sorting In case, the client wants to get the sorted list of companies, the GET /companies endpoint should accept multiple sort params in the query.
E.g GET /companies?sort=rank_asc would sort the companies by its rank in ascending order.
Filtering For filtering the dataset, we can pass various options through query params.
E.g GET /companies?category=banking&location=india would filter the companies list data with the company category of Banking and where the location is India.
Searching When searching the company name in companies list the API endpoint should be GET /companies?search=Digital Mckinsey
Pagination When the dataset is too large, we divide the data set into smaller chunks, which helps in improving the performance and is easier to handle the response. Eg. GET /companies?page=23 means get the list of companies on 23rd page.
If adding many query params in GET methods makes the URI too long, the server may respond with 414 URI Too long HTTP status, in those cases params can also be passed in the request body of the POST method.

7) Versioning
When your APIs are being consumed by the world, upgrading the APIs with some breaking change would also lead to breaking the existing products or services using your APIs.

http://api.yourservice.com/v1/companies/34/employees is a good example, which has the version number of the API in the path. If there is any major breaking update, we can name the new set of APIs as v2 or v1.x.x

## | 3. `api/groups` routes

'

#### 3.x. GET `api/groups/:groupId/files` get user's files that belongs to this group

#### 3.x. GET `api/groups/:groupId/files/:fileName/download` download file from group

#### 3.x. GET `api/groups/:groupId/posts` get ten most recent group posts

#### 3.x. GET `api/groups/:groupId/nextPosts/:postId` get next ten most recent posts (after `:postId`)

#### 3.x. GET `api/groups/:groupId/tasks` get group's *to do/in progress* tasks

#### 3.x. GET `api/group/:groupId/tasksDone` get 20 most recently created group's completed tasks

#### 3.x. GET `api/groups/:groupId/nextTasksDone/:postId` get next 20 most recently created group's completed tasks

#### 3.x. GET `api/groups/smart/:workspace` Get a user's smart groups within the given workspace

#### 3.x. POST `api/groups/smart/:groupId` Update a smart group with the given rules.

#### 3.x. GET `api/groups/smart/:groupId/settings` Get a smart group's settings

#### 3.x. PUT `api/groups/smart/:groupId/:rule` Delete a smart group's rule

#### 3.x. PUT `api/groups/smart/:groupId` Update a smart group's members

'

## | 4. `api/posts` routes

'

#### 4.x. GET `api/posts/:postId` get post

#### 4.x. POST `api/posts` add new post

#### 4.x. PUT `api/posts/:postId` edit/update post

#### 4.x. DELETE `api/posts/:postId` delete post

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
#### 4.x. ❗️GET `api/posts/comments/:commentId` get a single comment
||||||| merged common ancestors
#### 4.x. ❗️❗️POST `api/posts/:postId/comment` add new comment on post
=======
#### 4.x. ❗️❗️GET `api/posts/:postId/comments` get post
>>>>>>> create comments routes and controllers sturctures, refactor posts/users routes and controllers
||||||| merged common ancestors
#### 4.x. ❗️❗️GET `api/posts/:postId/comments` get post
=======
#### 4.x. ❗️❗️GET `api/posts/comments/:commentId` get a single comment
>>>>>>> add comments controllers and routes, not completed
||||||| merged common ancestors
#### 4.x. ❗️❗️GET `api/posts/comments/:commentId` get a single comment
=======
#### 4.x. ❗️GET `api/posts/comments/:commentId` get a single comment
>>>>>>> changes squashed

<<<<<<< HEAD
<<<<<<< HEAD
#### 4.x. ❗️GET `api/posts/:postId/comments` get first N post's comments
||||||| merged common ancestors
#### 4.x. ❗️❗️PUT `api/posts/:postId/comment/:commentId` update comment
=======
#### 4.x. ❗️❗️POST `api/posts/:postId/comments` add new comment on post
>>>>>>> create comments routes and controllers sturctures, refactor posts/users routes and controllers
||||||| merged common ancestors
#### 4.x. ❗️❗️POST `api/posts/:postId/comments` add new comment on post
=======
#### 4.x. ❗️GET `api/posts/:postId/comments` get first N post's comments
>>>>>>> add comments controllers and routes, not completed

<<<<<<< HEAD
<<<<<<< HEAD
#### 4.x. ❗️GET `api/posts/:postId/nextComments` get next N post's comments
||||||| merged common ancestors
#### 4.x. ❗️❗️DELETE `api/posts/:post_id/comment/:commentId` delete comment
=======
#### 4.x. ❗️❗️PUT `api/posts/:postId/comments/:commentId` update comment
>>>>>>> create comments routes and controllers sturctures, refactor posts/users routes and controllers
||||||| merged common ancestors
#### 4.x. ❗️❗️PUT `api/posts/:postId/comments/:commentId` update comment
=======
#### 4.x. ❗️GET `api/posts/:postId/nextComments` get next N post's comments
>>>>>>> add comments controllers and routes, not completed

<<<<<<< HEAD
<<<<<<< HEAD
#### 4.x. ❗️POST `api/posts/:postId/comments` add new comment on post
||||||| merged common ancestors
#### 4.x. ❗️❗️POST `api/posts/:postId/complete` mark post as complete
=======
#### 4.x. ❗️❗️DELETE `api/posts/:post_id/comments/:commentId` delete comment
>>>>>>> create comments routes and controllers sturctures, refactor posts/users routes and controllers
||||||| merged common ancestors
#### 4.x. ❗️❗️POST `api/posts/:postId/comment` add new comment on post

#### 4.x. ❗️❗️PUT `api/posts/:postId/comment/:commentId` update comment

#### 4.x. ❗️❗️DELETE `api/posts/:post_id/comment/:commentId` delete comment

#### 4.x. ❗️❗️POST `api/posts/:postId/complete` mark post as complete
=======
#### 4.x. ❗️❗️GET `api/posts/:postId/comments` get post
||||||| merged common ancestors
#### 4.x. ❗️❗️GET `api/posts/:postId/comments` get post
=======
#### 4.x. ❗️❗️GET `api/posts/comments/:commentId` get a single comment
>>>>>>> add comments controllers and routes, not completed

#### 4.x. ❗️GET `api/posts/:postId/comments` get first N post's comments

#### 4.x. ❗️GET `api/posts/:postId/nextComments` get next N post's comments

<<<<<<< HEAD
#### 4.x. ❗️❗️DELETE `api/posts/:post_id/comments/:commentId` delete comment
>>>>>>> create comments routes and controllers sturctures, refactor posts/users routes and controllers

<<<<<<< HEAD
#### 4.x. ❗️PUT `api/posts/comments/:commentId` update comment
||||||| merged common ancestors
#### 4.x. ❗️❗️PUT `api/posts/:postId/like` like post
=======
#### 4.x. ❗️PUT `api/posts/:postId/like` like post
>>>>>>> refactor user and posts controllers and routes, eliminated old user controllers and routes

<<<<<<< HEAD
#### 4.x. ❗️DELETE `api/posts/comments/:commentId` delete comment
||||||| merged common ancestors
#### 4.x. ❗️❗️DELETE `api/posts/:post_id/comments/:commentId` delete comment
=======
#### 4.x. ❗️POST `api/posts/:postId/comments` add new comment on post

#### 4.x. ❗️PUT `api/posts/comments/:commentId` update comment

<<<<<<< HEAD
#### 4.x. ❗️❗️DELETE `api/posts/comments/:commentId` delete comment
>>>>>>> add comments controllers and routes, not completed
||||||| merged common ancestors
#### 4.x. ❗️❗️DELETE `api/posts/:post_id/comments/:commentId` delete comment
=======
#### 4.x. ❗️POST `api/posts/:postId/comments` add new comment on post

#### 4.x. ❗️PUT `api/posts/comments/:commentId` update comment

#### 4.x. ❗️❗️DELETE `api/posts/comments/:commentId` delete comment
>>>>>>> add comments controllers and routes, not completed
||||||| merged common ancestors
#### 4.x. ❗️❗️DELETE `api/posts/comments/:commentId` delete comment
=======
#### 4.x. ❗️DELETE `api/posts/comments/:commentId` delete comment
>>>>>>> changes squashed

#### 4.x. ❗️PUT `api/posts/:postId/like` like post

#### 4.x. ❗️PUT `api/posts/:postId/unlike` unlike post
||||||| merged common ancestors
#### 4.x. ❗️❗️PUT `api/posts/:postId/unlike` unlike post
=======
#### 4.x. ❗️PUT `api/posts/:postId/unlike` unlike post
>>>>>>> refactor user and posts controllers and routes, eliminated old user controllers and routes

#### 4.x. PUT `api/posts/:postId/taskStatus` change task status

#### 4.x. PUT `api/posts/:postId/taskAssignee` change task assignee

'

## | 5. `api/users` routes

'

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
#### 5.x. ❗️GET `api/users/` get current user

#### 5.x. ❗️PUT `api/users/` Edit/Update user

#### 5.x. ❗️PUT `api/users/updateImage` Update user profile image

#### 5.x. ❗️GET `api/users/overview` get user's overview

||||||| merged common ancestors
=======
||||||| merged common ancestors
=======
#### 5.x. ❗️GET `api/users/` get current user

#### 5.x. ❗️PUT `api/users/` Edit/Update user

#### 5.x. ❗️PUT `api/users/updateImage` Update user profile image

>>>>>>> refactor user and posts controllers and routes, eliminated old user controllers and routes
#### 5.x. ❗️GET `api/users/overview` get user's overview

>>>>>>> create comments routes and controllers sturctures, refactor posts/users routes and controllers
||||||| merged common ancestors
=======
#### 5.x. ❗️GET `api/users/overview` get user's overview

>>>>>>> create comments routes and controllers sturctures, refactor posts/users routes and controllers
#### 5.x. GET `api/users/tasks` get user's *to do/in progress* tasks

#### 5.x. GET `api/users/tasksDone` get 20 most recently created user's tasks that are completed

#### 5.x. GET `api/users/nextTasksDone/:postId` get next 20 most recently created users's tasks that are completed

'

## | 6. `api/workspaces` routes

'

#### 6.x. POST `api/workspaces/:workspaceId/domains` add new domain to workspace's allowed domains

#### 6.x. DELETE `api/workspaces/:workspaceId/domains/:domain` remove domain from workspace's allowed domains

#### 6.x. GET `api/workspaces/:workspaceId/domains` get all workspace domains

#### 6.x. ❗️❗️ DELETE `api/workspaces/:workspaceId/users/:userId` remove user from workspace

#### 6.x. GET `api/workspaces/smart/:workspaceId` Get a user's smart groups within the given workspace

#### 6.x. GET `api/workspaces/emailDomains/:workspaceId/:query` Get all unique email domains that belong within the given workspace that match the given query.

#### 6.x. GET `api/workspaces/jobPositions/:workspaceId/:query` Get all job positions that belong within the given workspace that match the given query.

#### 6.x. GET `api/workspaces/skills/:workspaceId/:query` Get all unique skills that belong within the given workspace that match the given query.

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
||||||| merged common ancestors
'
=======
'
>>>>>>> add comments controllers and routes, not completed
||||||| merged common ancestors
'kk
=======
'
>>>>>>> create comments model, set up post model
||||||| merged common ancestors
'
=======
'
>>>>>>> add comments controllers and routes, not completed
