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