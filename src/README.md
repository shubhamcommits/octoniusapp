# |  DOCS - Octonius REST API
'

###### Status reference:

*❗️❗️ - Waiting backend and frontend implementation*

*❗️ - Backend ready, waiting frontend implementation*

'

## | Index: 

1. **`api/auths` routes**
2. **`api/files` routes**
3. **`api/groups` routes**
4. **`api/posts` routes**
5. **`api/users` routes**
6. **`api/workspaces` routes**
---

'

## | 3. `api/groups` routes

'

#### 3.x. GET `api/groups/:groupId/files` get user's files that belongs to this group

#### 3.x. GET `api/groups/:groupId/files/:fileName/download` download file from group

#### 3.x. GET `api/groups/:groupId/posts` get ten most recent group posts

#### 3.x. GET `api/groups/:groupId/nextPosts/:postId` get next ten most recent posts (after `:postId`)

#### 3.x. GET `api/groups/:groupId/tasks` get group's *to do/in progress* tasks

#### 3.x. GET `api/group/:groupId/tasksDone` get 20 most recently created group's completed tasks

#### 3.x. GET `api/groups/:groupId/nextTasksDone/:postId` get next 20 most recently created group's completed tasks

'

## | 4. `api/posts` routes

'

#### 4.x. GET `api/posts/:postId` get post

#### 4.x. POST `api/posts` add new post

#### 4.x. PUT `api/posts/:postId` edit/update post

#### 4.x. DELETE `api/posts/:postId` delete post

#### 4.x. ❗️❗️POST `api/posts/:postId/comment` add new comment on post

#### 4.x. ❗️❗️PUT `api/posts/:postId/comment/:commentId` update comment

#### 4.x. ❗️❗️DELETE `api/posts/:post_id/comment/:commentId` delete comment

#### 4.x. ❗️❗️POST `api/posts/:postId/complete` mark post as complete

#### 4.x. ❗️❗️PUT `api/posts/:postId/like` like post

#### 4.x. ❗️❗️PUT `api/posts/:postId/unlike` unlike post

#### 4.x. PUT `api/posts/:postId/taskStatus` change task status

#### 4.x. PUT `api/posts/:postId/taskAssignee` change task assignee

'

## | 5. `api/users` routes

'

#### 5.x. GET `api/users/tasks` get user's *to do/in progress* tasks

#### 5.x. GET `api/users/tasksDone` get 20 most recently created user's tasks that are completed

#### 5.x. GET `api/users/nextTasksDone/:postId` get next 20 most recently created users's tasks that are completed

'

## | 6. `api/workspaces` routes

'

#### 6.x. ❗️ POST `api/workspaces/:workspaceId/domains` add new domain to workspace's allowed domains

#### 6.x. ❗️ DELETE `api/workspaces/:workspaceId/domains/:domain` remove domain from workspace's allowed domains

#### 6.x. ❗️ GET `api/workspaces/:workspaceId/domains` get all workspace domains

#### 6.x. ❗️❗️ DELETE `api/workspaces/:workspaceId/users/:userId` remove user from workspace

'