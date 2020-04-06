# | DOCS - Group REST API

## | Index:

1. **`api/groups` routes**
2. **`api/groups/pulse` routes**
3. **`api/groups/members` routes**


## | 1. `api/groups` routes

### 1.x. GET `api/groups/list` Get list of first 10 groups present in the database
    * Success Response
        Code: 200
        Content: groups
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.x. GET `api/groups/list/next` Get list of next 5 groups present in the database based on the lastGroupId from fetched from the list of first 10 groups
    * Query Params
        * lastGroupId
    * Success Response
        Code: 200
        Content: groups
    * Error Response
        Code: 400
        Content: 'Please provide the lastGroupId as the query parameter!'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 1.x. GET `api/groups/:groupId` Get group based on the groupId
    * URL Params
        * groupId
    * Success Response
        Code: 200
        Content: group
    * Error Response
        Code: 404
        Content: 'Group not found, Invalid groupId!'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 1.x. POST `api/groups/` Create new group in the workspace
    * Data Params
        * group_name
        * workspace_name
        * workspaceId
        * userId
        * type
    * Success Response
        Code: 200
        Content: group
    * Error Response
        Code: 409
        Content: 'Oops group name already exist, please try a different one!'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 1.x. PUT `api/groups/:groupId` Updates the group data(only description and group_name)
    * URL Params
        * groupId
    * Query Params
        * group_name
        * description
    * Success Response
        Code: 200
        Content: group
    * Error Response
        Code: 404
        Content: 'Group not found, invalid groupId!'

        Or

        Code: 400
        Content: 'Insufficient data, please check if you are passing description or group_name or both of them together in the query parameter!'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 1.x. DELETE `api/groups/:groupId` Removes the group from the database
    * URL Params
        * groupId
    * Success Response
        Code: 200
        Content: group
    * Error Response
        Error

### 1.x. GET `api/groups` Get list of first 10 groups of which a user is a part of
    * Query Params
        * workspaceId
        * userId
    * Success Response
        Code: 200
        Content: groups
    * Error Response
        Code: 400
        Content: 'Please provide both workspaceId and userId as the query parameter!'

        Or

        Code: 404
        Content: 'Group not found, Invalid workspaceId or userId!'

        Or 
        Error

### 1.x. GET `api/groups/:lastGroupId/next` Get list of next 5 groups of which a user is a part of, based on the lastGroupId fetched from the list of first 10 groups
    * URL Params
        * lastGroupId
    * Query Params
        * workspaceId
        * userId
    * Success Response
        Code: 200
        Content: groups
    * Error Response
        Code: 400
        Content: 'Please provide both workspaceId and userId as the query parameter!'

        Or 

        Code: 500
        Content: 'Internal Server Error!'


## | 2. `api/groups/pulse` routes

### 2.x. GET `api/groups/pulse` Get pulse description based on the groupId
    * Query Params
        * groupId
    * Success Response
        Code: 200
        Content: group
    * Error Response
        Error

### 2.x. PUT `api/groups/pulse` Updates the group pulse data(only pulse_description)
    * Query Params
        * groupId
    * Data Params
        * pulse_desciption
    * Success Response
        Code: 200
        Content: group
    * Error Response
        Error
    
### 2.x. GET `/api/groups/pulse/list` Get list of first 10 groups present in the workspace
    * Query Params
        * workspaceId
    * Success Response
        Code: 200
        Content: groups
    * Error Response
        Error

### 2.x. GET `api/groups/pulse/list/next` Get list of next 5 groups present in the workspace based on the lastGroupId from fetched from the list of first 10 groups
    * Query Params
        * workspaceId
        * lastGroupId
    * Success Response
        Code: 200
        Content: group
    * Error Response
        Error

### 2.x. GET `api/groups/pulse/tasks` Get count of tasks due this week
    * Query Params
        * groupId
        * status [Optional]
    * Success Response
        Code: 200
        Content: numTasks
    * Error Response
        Error


## | 2. `api/groups/members` routes

### 3.x. GET `api/groups/members` Get a list of first 10 workspace members

    * Query Params
        * groupId
        * query
    * Success Response
        Code: 200
        Content: members
    * Error Response
        Code: 400
        Content: 'Please provide groupId as the query parameter!'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 3.x. GET `api/groups/members/next` Get a list of next 5 workspace members based on the lastUserId fetched from the first 10 workspace

    * Query Params
        * groupId
        * query
        * lastUserId
     * Success Response
        Code: 200
        Content: members
    * Error Response
        Code: 400
        Content: 'Please provide groupId and lastUserId as the query parameter!'

        Or

        Code: 500
        Content: 'Internal Server Error!'

### 3.x. POST `api/groups/members/add` Add a new user to the group

    * Data Params
        * groupId
        * member
            * _id
            * role
    * Success Response
        Code: 200
        Content: groupData
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 3.x. DELETE `api/groups/members/remove` Removes a user from the group

    * Data Params
        * groupId
        * userId
    * Success Response
        Code: 200
        Content: 'User has been removed from _____ group'
    * Error Response
        Code: 404
        Content: 'Not Found'

        Or

        Code: 500
        Content: 'Internal Server Error!'
