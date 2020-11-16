import { Notification } from "../models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";
import { NotificationsService } from "../service";
import { sendErr } from "../../utils/sendError";
import { validateId } from "../../utils/helperFunctions";

// Creating Service class in order to build wrapper class
const notificationService = new NotificationsService()

/*  ===============================
 *  -- NOTIFICATIONS CONTROLLERS --
 *  ===============================
 */

export class NotificationsController {

    /**
     * This function is responsible for notifying the user on mention on new comment
     * @param { _id, _content_mentions, _commented_by, _post } comment 
     */
    async newCommentMentions(req: Request, res: Response, next: NextFunction) {

        const { comment } = req.body;

        try {

            // Call Service Function for newCommentMentions
            await notificationService.newCommentMentions(comment).then(() => {
                return res.status(200).json({
                    message: `Comment Mentions succeded!`,
                });
            }).catch(err => {
                return sendError(res, new Error(err), 'Internal Server Error!', 500);
            });

        } catch (err) {
            // Error Handling
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { _id, _assigned_to, _posted_by } post 
     */
    async newEventAssignments(req: Request, res: Response, next: NextFunction) {

        const { post } = req.body;
        try {

            // Call Service Function for newEventAssignments
            await notificationService.newEventAssignments(post);

            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments succeded!`,
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for notifying the user on mention on new post
     * @param { _id, _posted_by, _content_mentions } post 
     */
    async newPostMentions(req: Request, res: Response, next: NextFunction) {

        const { post } = req.body;
        try {
            
            // Call Service function for newPostMentions
            await notificationService.newPostMentions(post);

            // Send status 200 response
            return res.status(200).json({
                message: 'New Post Mention succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for notifying the user on mention on new Folio
     * @param file
     * @param user
     * @param mention
     */
    async newFolioMention(req: Request, res: Response, next: NextFunction) {

        const { mention, file, user } = req.body;

        try {
            // Call Service function for newPostMentions
            await notificationService.newFolioMentions(file, user, mention);

            // Send status 200 response
            return res.status(200).json({
                message: 'New Folio Mention succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new task to them
     * @param { _id, _assigned_to, _posted_by } post 
     */
    async newTaskAssignment(req: Request, res: Response, next: NextFunction) {

        const { post } = req.body;
        try {
            
            // Call Service Function for newTaskAssignments
            await notificationService.newTaskAssignment(post);

            // Send status 200 response
            return res.status(200).json({
                message: 'New Task Assignment Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible to notifying all the user on re-assigning of a new task to them
     * @param { _id, _assigned_to, _posted_by } post
     */
    async newTaskReassignment(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { post, assigneeId } = req.body;

        try {
            
            // Call Service function for newTaskReassignment
            await notificationService.newTaskReassignment(post, assigneeId);

            // Send status 200 response
            return res.status(200).json({
                message: 'New Task Reassignment Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for fetching the latest first 5 read notifications
     * @param userId 
     */
    async getRead(req: Request, res: Response, next: NextFunction) {

        const { userId } = req.body;

        // Validate userID
        if (!validateId(userId)){
            return sendErr(res, new Error('Invalid ObjectId'), 'The ObjectId you entered is invalid!', 500);
        }
        try {
            
            // Call service function for getRead
            await notificationService.getRead(userId).then(notifications => {
                    return res.status(200).json({
                    message: 'Notification successfully retrieved',
                    notifications: notifications
                });
            }).catch(err => {
                return sendErr(res, new Error(err), 'Internal Server Error!', 500);
            });


        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for fetching the latest first 5 un-read notifications
     * @param userId 
     */
    async getUnread(req: Request, res: Response, next: NextFunction) {

        const { userId } = req.body;

        // Validate userId
        if (!validateId(userId)){
            return sendErr(res, new Error('Invalid ObjectId'), 'The ObjectId you entered is invalid!', 500);
        }
        try {

            // Call service function for getUnread
            await notificationService.getUnread(userId).then(notifications => {
                return res.status(200).json({
                    message: 'Successfully retrieved unread notifications',
                    notifications: notifications
                });
            }).catch(err => {
                return sendErr(res, new Error(err), 'Internal Server Error!', 500);
            })
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for fetching the marking the notifications to read
     * @param topListId 
     */
    async markRead(req: Request, res: Response, next: NextFunction) {

        const { topListId } = req.body;
        try{
            // Call service function for markRead
            await notificationService.markRead(topListId).then(updated => {
                return res.status(200).json({
                    message: updated
                });
            }).catch(err => {
                return sendErr(res, new Error(err), 'Internal Server Error!', 500);
            })
        } catch (err) {
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };


    async taskStatusChanged(req: Request, res: Response, next: NextFunction) {
        const { post, userId } = req.body;
        
        try {
            const status = (post.task.status === 'in progress') ? 'started' : 'completed';
            // Call Service Function for taskStatusChanged
            const index = post._assigned_to.findIndex(assignee => assignee._id == post._posted_by);
            if (index < 0) {
                await notificationService.taskStatusChanged(post, status, userId, post._posted_by);
            }

            if (post._assigned_to) {
                await notificationService.taskStatusChanged(post, status, userId);
            }

            post._followers.forEach(async follower => {
                const index = post._assigned_to.findIndex(assignee => assignee._id == follower);
                if (index < 0 && follower !== post._posted_by) {
                    await notificationService.taskStatusChanged(post, status, userId, follower);
                }
            });

            // Send status 200 response
            return res.status(200).json({
                message: 'New Task Status Change Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async newComment(req: Request, res: Response, next: NextFunction) {
        const { comment, post } = req.body;
        try {
            // Call Service Function for newComment
            await notificationService.newComment(comment, post._posted_by);

            if (post._assigned_to) {
                post._assigned_to.forEach(async assignee => {
                    await notificationService.newComment(comment, assignee); 
                });
            }
            if(post._followers) {
                post._followers.forEach(async follower => {
                    const index = post._assigned_to.findIndex(assignee => assignee === follower);
                    if (follower !== post._posted_by && index < 0) {
                        await notificationService.newComment(comment, follower);
                    }
                });
            }
            // Send status 200 response
            return res.status(200).json({
                message: 'New Comment Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async followPost(req: Request, res: Response, next: NextFunction) {
        const { post, follower } = req.body;
        try {
            // Call Service Function for followPost
            await notificationService.followPost(post, follower);

            // Send status 200 response
            return res.status(200).json({
                message: 'Post Followed Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async likePost(req: Request, res: Response, next: NextFunction) {
        const { post, user } = req.body;
        try {
            // Call Service Function for likePost
            await notificationService.likePost(post, post._posted_by, user);

            post._followers.forEach(async follower => {
                if (post._posted_by !== follower) {
                    await notificationService.likePost(post, follower, user);
                }
            });

            // Send status 200 response
            return res.status(200).json({
                message: 'Post Liked Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async likeComment(req: Request, res: Response, next: NextFunction) {
        const { comment, user } = req.body;
        try {
            // Call Service Function for likeComment
            await notificationService.likeComment(comment, comment._commented_by, user);

            let index = comment._post._assigned_to.findIndex(assignee => assignee === comment._commented_by);
            if (comment._post._posted_by && index < 0) {
                await notificationService.likeComment(comment, comment._post._posted_by, user);
            }

            comment.post._followers.forEach(async follower => {
                index = comment._post._assigned_to.findIndex(assignee => assignee === follower);
                if (index < 0 && follower !== comment._commented_by) {
                    await notificationService.likeComment(comment, follower, user);
                }
            });

            // Send status 200 response
            return res.status(200).json({
                message: 'Comment Liked Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}
