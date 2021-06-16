import express from 'express';
import { NotificationsController } from '../controllers'

const routes = express.Router();
const notificationFunctions = new NotificationsController();

//This route is responsible for notifying the user on mention on new comment
routes.post('/new-comment-mention', notificationFunctions.newCommentMentions);

//This route is responsible to notifying all the user on assigning of a new event to them
routes.post('/new-event', notificationFunctions.newEventAssignments);

// This route is responsible for notifying the user of a new post in on of his/her groups
routes.post('/new-post', notificationFunctions.newPost);

//This route is responsible for notifying the user on mention on new Folio
routes.post('/new-folio-mention', notificationFunctions.newFolioMention);

//This route is responsible to notifying all the user on assigning of a new task to them
routes.post('/new-task', notificationFunctions.newTaskAssignment);

//This route is responsible to notifying all the user on re-assigning of a new task to them
routes.post('/task-reassign', notificationFunctions.newTaskReassignment);

//This route is responsible for notifying the user when the status changes
routes.post('/status-change', notificationFunctions.taskStatusChanged);

//This route is responsible for notifying the user on a new comment
routes.post('/new-comment', notificationFunctions.newComment);

//This route is responsible for notifying the user when his post is followed
routes.post('/new-follow-post', notificationFunctions.followPost);

//This route is responsible for notifying the user when his post is liked
routes.post('/new-like-post', notificationFunctions.likePost);

//This route is responsible for notifying the user when his comment is liked
routes.post('/new-like-comment', notificationFunctions.likeComment);

// This route is responsible for notifying the user on mention on new post
routes.post('/new-mention', notificationFunctions.newPostMentions);

export { routes as notificationRoutes };