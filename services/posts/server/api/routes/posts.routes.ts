import express from 'express';
import { PostController } from '../controllers';
import { Auths, postFileHandler } from '../utils';

const routes = express.Router();
const postController = new PostController();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// -| MAIN |-

// This route is used to add a post
routes.post('/', postFileHandler, postController.add);

/**
 * GET - This route fetches the list of posts present in a group
 * @param { group Id, lastPostId } query
 * @param lastPostId - optional
 */
routes.get('/', postController.getPosts);

// This route is used to edit a post
routes.put('/:postId', postFileHandler, postController.edit);

// This route is used to retrieve a post
routes.get('/:postId', postController.get);

// This route is used to remove a post
routes.delete('/:postId', postController.remove);

// -| TAGS |-

// GET - This function fetches the tags list from a group
routes.get('/group/tags', postController.getTags)

// -| POST ACTIONS |-

// This route is used to like a post
routes.post('/like', postController.like);

// This route is used to unlike a post
routes.post('/unlike', postController.unlike);

// -| FETCH POSTS |-

// This route is used to get this month's tasks
routes.get('/month-tasks', postController.getThisMonthTasks);

// This route is used to get this week's tasks
routes.get('/week-tasks', postController.getThisMonthTasks);

// This route is used to get next 5 tasks for this week
routes.get('/next-tasks', postController.getNextTasks);

// This route is used to get this month's events
routes.get('/month-events', postController.getThisMonthEvents);

// This route is used to get this week's events
routes.get('/week-events', postController.getThisMonthEvents);

// This route is used to get next 5 events for this week
routes.get('/next-events', postController.getNextEvents);

// -| TASKS |-

// PUT - Change task assignee
routes.put('/:postId/task-assignee', postController.changeTaskAssignee);

// PUT - Change task due-date
routes.put('/:postId/task-due-date', postController.changeTaskDueDate);

// PUT - Change task status
routes.put('/:postId/task-status', postController.changeTaskStatus);

// PUT - Change task column
routes.put('/:postId/task-column', postController.changeTaskColumn);


// -| RECENT ACTIVITY |-

// GET - Get Recent Activity
routes.get('/test/recents', postController.getRecentActivity);

// GET - Get next 5 recent posts
routes.get('/test/recents/next', postController.getNextRecentActivity);

// GET - Get recent groups
routes.get('/test/recents/groups', postController.getRecentGroups);


export { routes as postRoutes };