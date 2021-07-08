import { sendMail } from '../../utils';
import express from 'express';

// Routes List
const routes = express.Router();

// POST - Signup email confirmation
routes.post('/sign-up', sendMail.signup);;

// POST - Reset password
routes.post('/reset-password', sendMail.resetPassword);

// POST - New Workspace
routes.post('/new-workspace', sendMail.newWorkspace);

// POST - Joined New Group
routes.post('/group-joined', sendMail.joinedGroup);

// POST - User Mentioned Post
// routes.post('/user-post-mention', sendMail.userMentionedPost);

// POST - User Mentioned Comment
// routes.post('/user-comment-mention', sendMail.userMentionedComment);

//POST - Task Assigned
// routes.post('/task-assigned', sendMail.taskAssigned);

//POST - Task Reminder
// routes.post('/task-reminder', sendMail.scheduleTaskReminder);

// POST - Event Reminder
// routes.post('/event-reminder', sendMail.scheduleEventReminder);

// POST - Event Assigned
// routes.post('/event-assigned', sendMail.eventAssigned);

// POST - Workspace Joined
routes.post('/join-workspace', sendMail.joinWorkspace);

// POST - Task Reassigned
// routes.post('/task-reassign', sendMail.taskReassigned);

// POST - Join Workplace
routes.post('/invite-user', sendMail.joinWorkspace);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as mailRoutes }
