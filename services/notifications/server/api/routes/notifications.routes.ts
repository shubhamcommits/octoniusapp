import express from 'express';
import { NotificationsController } from '../controllers'

const routes = express.Router();
const notificationFunctions = new NotificationsController();

//This route is responsible for notifying the user on mention on new comment
routes.post('/new-comment', notificationFunctions.newCommentMentions);

//This route is responsible to notifying all the user on assigning of a new event to them
routes.post('/new-event', notificationFunctions.newEventAssignments);

//This route is responsible for notifying the user on mention on new post
routes.post('/new-mention', notificationFunctions.newPostMentions);

//This route is responsible to notifying all the user on assigning of a new task to them
routes.post('/new-task', notificationFunctions.newTaskAssignment);

//This route is responsible to notifying all the user on re-assigning of a new task to them
routes.post('/task-reassign', notificationFunctions.newTaskReassignment);

//This route is responsible for fetching the latest first 5 read notifications
routes.get('/read', notificationFunctions.getRead);

//This route is responsible for fetching the latest first 5 un-read notifications
routes.get('/unread', notificationFunctions.getUnread);

//This function is responsible for fetching the marking the notifications to read
routes.post('/mark-read', notificationFunctions.markRead);

export { routes as notificationRoutes };