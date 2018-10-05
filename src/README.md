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

'

## | 4. `api/posts` routes

'

#### 4.x. GET `api/posts/:postId` get post

#### 4.1. POST `api/posts` add new post

#### 4.2. PUT `api/posts/:postId` edit/update post

#### 4.3. DELETE `api/posts/:postId` delete post

#### 4.4. ❗️❗️POST `api/posts/:postId/comment` add new comment on post

#### 4.5. ❗️❗️PUT `api/posts/:postId/comment/:commentId` update comment

#### 4.6. ❗️❗️DELETE `api/posts/:post_id/comment/:commentId` delete comment

#### 4.7. ❗️❗️POST `api/posts/:postId/complete` mark post as complete

#### 4.8. ❗️❗️PUT `api/posts/:postId/like` like post

#### 4.8. ❗️❗️PUT `api/posts/:postId/unlike` unlike post

'

## | 6. `api/workspaces` routes

'

#### 6.x. ❗️ POST `api/workspaces/:workspaceId/domains` add new domain to workpsace's allowed domains

#### 6.x. ❗️ DELETE `api/workspaces/:workspaceId/domains` remove domain from workpsace's allowed domains

#### 6.x. ❗️❗️ GET `api/workspaces/:workspaceId/domains` get all workspace domains



'