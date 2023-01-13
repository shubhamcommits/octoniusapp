import express from 'express';
import { CalendarController, FilesControllers, PostController } from '../controllers';
import { Auths, postFileUploader } from '../utils';

const routes = express.Router();

/**
 * Posts Controller Class Object
 */
const postController = new PostController();

/**
 * File Controller Class Object
 */
const filesControllers = new FilesControllers();

/**
 * Calendar Controller Class Object
 */
let calendarController = new CalendarController();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// POST - Logout from the server
//routes.post('/auths/sign-out', auths.signOut);

// -| MAIN |-

// This route is used to add a post
routes.post('/', postFileUploader, postController.add.bind(postController));

/**
 * GET - This route fetches the list of posts present in a group
 * @param { group Id, lastPostId } query
 * @param lastPostId - optional
 */
routes.get('/', postController.getPosts);

/**
 * GET - This route fetches the list of archived tasks present in a group
 * @param { groupId } query
 */
routes.get('/archived', postController.getArchivedTasks);

/**
 * GET - This route fetches the list of NS present in user´s groups
 */
routes.get('/user-groups-northstar', postController.getNorthStarTasks);

/**
 * GET - This route fetches the list of global NS
 */
routes.get('/user-global-northstar', postController.getGlobalNorthStarTasks);

/**
 * GET - This route fetches the stats for the NS page
 */
routes.get('/user-northstar', postController.getNorthStarStats);

/**
 * GET - This route fetches the stats for the NS page
 */
routes.get('/global-northstar', postController.getGlobalNorthStarStats);

// This route is used to edit a post
routes.put('/:postId', postFileUploader, postController.edit);

// This route is used to edit a post
routes.put('/:postId/title', postController.editPostTitle);

// This route is used to edit a post
routes.put('/:postId/content', postController.editPostContent);

// This route is used to edit a post
routes.put('/:postId/attach-files', postFileUploader, postController.attachFiles);

// This route is used to edit a post tags
routes.put('/:postId/editTags', postController.editTags);

// This route is used to retrieve a post
routes.get('/:postId', postController.get);

// This route is used to remove a post
routes.delete('/:postId', postController.remove);

// -| TAGS |-

// GET - This function fetches the tags list from a group
routes.get('/group/tags', postController.getTags)

// -| POST ACTIONS |-

// This route is used to like a post
routes.post('/:postId/like', postController.like);

// This route is used to unlike a post
routes.post('/:postId/unlike', postController.unlike);

// This route is used to unlike a post
routes.get('/:postId/liked-by', postController.likedBy);

// This route is used to like a post
routes.post('/:postId/follow', postController.follow);

// This route is used to unlike a post
routes.post('/:postId/unfollow', postController.unfollow);

// -| FETCH POSTS |-

/**
 * GET - This route is used to get this months task and events for the calendar
 * @param { year, month, groupId, userId } query
 * @param userId - optional
 */
routes.get('/calendar/timeline', calendarController.getCalendarPosts);

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

// This route is used to get the workspace's posts
routes.get('/workspace/posts', postController.getWorspacePosts);

// This route is used to get the group's posts
routes.get('/group/posts', postController.getGroupPosts);

// This route is used to get the column's posts
routes.get('/column/posts', postController.getColumnPosts);

// This route is used to get the group's tasks
routes.get('/group/tasks', postController.getAllGroupTasks);

// This route is used to get the group's tasks
routes.get('/project/tasks', postController.getAllProjectTasks);

// -| TASKS |-
// PUT - Add a new assignee to the task
routes.put('/:postId/add-assignee', postController.addAssignee.bind(postController));

// PUT - Remove a new assignee from the task
routes.put('/:postId/remove-assignee', postController.removeAssignee.bind(postController));

// PUT - Change task assignee
routes.put('/:postId/task-assignee', postController.changeTaskAssignee.bind(postController));

// PUT - Change task due-date
routes.put('/:postId/task-due-date', postController.changeTaskDueDate.bind(postController));

// PUT - Change task status
routes.put('/:postId/task-status', postController.changeTaskStatus.bind(postController));

// PUT - Change task column
routes.put('/:postId/task-column', postController.changeTaskColumn.bind(postController));

// PUT - Change task start or end date
routes.put('/:postId/update-date', postController.changeTaskDate.bind(postController));

// This route is used to get the subtasks of a task
routes.get('/post/subtasks', postController.getSubtasks);

// This route is used to get the subtasks of a task
routes.get('/post/subtasks-count', postController.getSubtasksCount);


// -| RECENT ACTIVITY |-

// GET - Get Recent Activity
routes.get('/test/recents', postController.getRecentActivity);

// GET - Get next 5 recent posts
routes.get('/test/recents/next', postController.getNextRecentActivity);

// GET - Get recent groups
routes.get('/test/recents/groups', postController.getRecentGroups);

// -| CUSTOM FIELDS |-
// PUT - Change custom field value
routes.put('/:postId/customField', postController.saveCustomField.bind(postController));

// POST - Used to copy the post to another group
routes.post('/copy-to-group', postController.copyToGroup);

// PUT - Used to move the post to another group
routes.put('/:postId/move-to-group', postController.moveToGroup);

// POST - Delete the attached file
routes.post('/delete-attached', filesControllers.deleteAttached);

// GET - This route is used to get 10 tasks which could be a parent of the caller task
routes.get('/:currentPostId/searchParent', postController.searchPossibleParents);

// PUT - Used to set a parent task to a task
routes.put('/:postId/set-parent', postController.setParentTask);

// PUT - Used to set a dependency task to a task
routes.put('/:postId/set-dependency', postController.setDependencyTask);

// PUT - Used to remove a dependency task to a task
routes.put('/:postId/remove-dependency', postController.removeDependencyTask);



routes.post('/:postId/gantt-task-dates-update',postController.updateGanttTasksDates.bind(postController))

// POST - Used to clone the post to a user
routes.post('/clone-to-assignee', postController.cloneToAssignee);

/**
 * GET - This route fetches the list of templates present in a group
 * @param { groupId } query
 */
routes.get('/post/templates', postController.getGroupTemplates);

// POST - Used to create a template
routes.post('/create-template', postController.createTemplate);

// PUT - Used to overwrite a template
routes.put('/:postId/overwrite-template', postController.overwriteTemplate);

// POST - Create a task from a template
routes.post('/create-task-from-template', postController.createTaskFromTemplate);

// PUT - Change task allocation
routes.put('/:postId/save-allocation', postController.saveAllocation);

// PUT - Change post pin/unpin
routes.put('/:postId/pin-to-top', postController.pinToTop);

// PUT - Vote an idea
routes.put('/:postId/vote-idea', postController.voteIdea);

// PUT - Enable/Disable Shuttle Type on a task
routes.put('/:postId/selectShuttleGroup', postController.selectShuttleGroup.bind(postController));

// PUT - Change the section of the Shuttle task
routes.put('/:postId/selectShuttleSection', postController.selectShuttleSection.bind(postController));

// PUT - Change the status of the Shuttle task
routes.put('/:postId/selectShuttleStatus', postController.selectShuttleStatus.bind(postController));

// PUT - Run automator
routes.put('/:postId/automator', postController.runAutomator.bind(postController));

export { routes as postRoutes };