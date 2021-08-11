# | DOCS - Authentication REST API

## | Index:

1. **`api/auths` routes**
2. **`api/auths/passwords` routes**


## | 1. `api/auths` routes

### 1.1. POST `api/auths/sign-in` Signs In the user and generate a new token
    * Data Params
        * email
        * password
        * workspace_name
    * Success Respoonse
        Code: 200
        Content: token, user
    * Error Response
        Code: 401
        Content: 'Please enter a valid combination or workspace name and user email!', 'Please enter a valid email or password!'

        OR

        Code: 500
        Content: 'Internal Server Error!'

### 1.2. POST `api/auths/sign-up` Signs Up the user and creates a new account
    * Data Params
        * workspace_name
        * email
        * password
        * first_name
        * last_name
    * Success Response
        Code: 200
        Content: token, user
    * Error Response
        Code: 404
        Content: 'Workspace does not exist or this email is not allowed to join this workspace!'

        Or

        Code: 401
        Content: 'Unable to encrypt the password to the server, please try with a different password!'

        Or

        Code: 500
        Content: 'Unable to create the user, some unexpected error occurred!', 'Unable to update the global group, some unexpected error occurred!', 'Unable to update the user, some unexpected error occurred!', 'Unable to update the workspace, some unexpected error occurred!', 'Either workspace doesn\'t exist or user is already a member of this workspace!'

        Or

        Code: 409
        Content: 'Group name already taken, please choose another name!'

### 1.3. POST `api/auths/sign-out` Signs Out the current loggedIn User
    * Success Response
        Code: 200
        Content: 'User Logged Out!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'



## | 2. `api/auths/passwords` rooutes

### 2.1. POST `api/auths/passwords/reset` reset user password
    * Data Params
        * resetPwdId
        * password
    * Success Response
        Code: 200
        Content: 'succesfully changed password'
    * Error Response
        Code: 401
        Content: 'Your link is not valid', 'An error occurred trying to create the password, please choose another password!'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 2.2. POST `api/auths/passwords/send-mail` send reset password email
    * Data Params
        * workspace_name
        * email
    * Success Response
        Code: 200
        Content: 'successfully sent email'
    * Error Response
        Code: 401
        Content: 'We were unable to find a user with this email / workspace combination! Please try again.', 'We were unable to find this workspace! Please try again.'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 2.3. GET `api/auths/passwords/rest-details/:userId` get reset password details
    * URL Params
        * userId
    * Success Response
        Code: 200
        Content: resetPwdDoc
    * Error Response
        Code: 401
        Content: 'This link is no longer valid'

        Or

        Code: 500
        Content: 'Internal Server Error!'