# | DOCS - Posts REST API

## | Index:

1. **`api/posts` routes**
2. **`api/posts/comments` routes**


## | 1. `api/posts` routes

### 1.1. POST `api/posts/` This route is used to add a post
    * Data Params
        * post
    * Success Response
        Code: 200
        Content: postData
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.2. GET `api/posts/` This route fetches the list of posts present in a group
    * Query Params
        * groupId
        * lastPostId
    * Success Response
        Code: 200
        Content: posts
    * Error Response
        Code: 400
        Content: 'Please provide the groupId as the query paramater!'

        Or

        Code: 400
        Content: 'Unable to fetch the posts, kindly check the stack trace for error'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 1.3. POST `api/posts/:postId` This route is used to edit a post
    * 