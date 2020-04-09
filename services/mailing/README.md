# | DOCS - Mailing REST API

## | Index:

1. **`api/mails` routes**

## | 1. `api/mails` routes

### 1.1. POST `api/mails/sign-up` Signup email confirmation
    * Data Params
        * user
    * Success Response
        Code: 200
        Content: 'Sign-up email sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.2. POST `api/mails/reset-password` Reset password
    * Data Params
        * workspace
        * user
    * Sucess Response
        Code: 200
        Content: 'Reset password email sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'
    
### 1.3. POST `api/mails/new-workspace` New Workspace
    * Data Params
        * workspace
    * Success Response
        Code: 200
        Content: 'New Workspace email sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.4. POST `api/mails/group-joined` Joined new group
    * Data Params
        * groupData
        * adminData
        * memberData
    * Success Response
        Code: 200
        Content: 'Join Group email sent!'
    * Error Respoonse
        Code: 500
        Content: 'Internal Server Error!'

### 1.5. POST `api/mails/user-post-mention` User post mentioned
    * Data Params
        * post
        * user
    * Success Response
        Code: 200
        Content: 'User mentioned post mail sent'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.6. POST `api/mails/user-comment-mention` User mentioned comment
    * Data Params
        * comment
        * post
        * user
    * Success Response
        Code: 200
        Content: 'User Mentioned Post mail sent'\
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.7. POST `api/mails/task-assigned` Task Assigned
    * Data Params
        * post
    * Success Response
        Code: 200
        Content: 'User task mail sent'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.8. POST `api/mails/task-reminder` Task reminder
    * Data Params
        * post
    * Success Response
        Code: 200
        Content: 'User task reminder mail sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.9. POST `api/mails/event-reminder` Event reminder
    * Data Params
        * post
    * Success Response
        Code: 200
        Content: 'Event reminder mail sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.10. POST `api/mails/event-assigned` Event assigned
    * Data Params
        * post
    * Success Response
        Code: 200
        Content: 'Event assigned mail sent'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.11. POST `api/mails/join-workspace` Workspace joined
    * Data Params
        * reqData
            * user_id
            * workspace_id
            * email
    * Success Response
        Code: 200
        Content: 'Join group email sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.12. POST `api/mails/task-reassign` Task Reassigned
    * Data Parama
        * post
    * Success Response
        Code: 200
        Content: 'User task reassign email sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'

### 1.13. POST `api/mails/task-complete` User completed task
    * Data Params
        * userWhoChangedStatusId
        * post
    * Success Response
        Code: 200
        Content: 'User task completed mail sent!'
    * Error Response
        Code: 500
        Content: 'Internal Server Error!'