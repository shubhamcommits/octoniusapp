import express from 'express';
import { Auths } from '../../utils';
import { NotificationsController, ApprovalNotificationsController } from '../controllers'

const routes = express.Router();
const notificationFunctions = new NotificationsController();
const approvalFunctions = new ApprovalNotificationsController();

// Define auths helper controllers
const auth = new Auths();

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

// This route is responsible for notifying the user when is added to a group
routes.post('/join-group', notificationFunctions.joinGroup);

// This route is responsible for notifying the user when is removed from a group
routes.post('/leave-group', notificationFunctions.leaveGroup);

// POST - shuttle-task
routes.post('/shuttle-task', notificationFunctions.shuttleTask);

// This route is responsible for notifying the user when a approval flow is launched
routes.post('/launch-approval-flow', approvalFunctions.launchApprovalFlow);

// POST - reject-item
routes.post('/reject-item', approvalFunctions.rejectItem);

// POST - item-approved
routes.post('/item-approved', approvalFunctions.itemApproved);

// GET - get unread notifications
routes.get('/top-unread', auth.verifyToken, auth.isLoggedIn, notificationFunctions.topUnread);

// GET - get unread notifications
routes.get('/unread', auth.verifyToken, auth.isLoggedIn, notificationFunctions.unread);

// GET - get unread posts
routes.get('/top-unread-posts', auth.verifyToken, auth.isLoggedIn, notificationFunctions.unreadTopPosts);

// GET - get unread posts
routes.get('/unread-posts', auth.verifyToken, auth.isLoggedIn, notificationFunctions.unreadPosts);

// GET - get pending approvals
routes.get('/top-pending-approvals', auth.verifyToken, auth.isLoggedIn, notificationFunctions.pendingTopApprovals);

// GET - get pending approvals
routes.get('/pending-approvals', auth.verifyToken, auth.isLoggedIn, notificationFunctions.pendingApprovals);

export { routes as notificationRoutes };