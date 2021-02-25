import { Notification, Post, User } from "../models";
import { Response, Request, NextFunction } from "express";
import { sendError} from "../../utils";
import { NotificationsService } from "../service";
import { sendErr } from "../../utils/sendError";
import { validateId } from "../../utils/helperFunctions";
import { helperFunctions } from '../../utils';
import axios from 'axios';

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

        const comment = JSON.parse(req.body.comment);

        try {

            // Call Service Function for newCommentMentions
            await notificationService.newCommentMentions(comment).then(() => {
                return res.status(200).json({
                    message: `Comment Mentions Succeeded!`,
                });
            }).catch(err => {
                return sendError(res, new Error(err), 'Internal Server Error!', 500);
            });
            
            const comment_mentions_ids = comment._content_mentions;
            let comment_mentions_name_array = [];
            for(let i = 0; i < comment_mentions_ids.length; i++){
                const comment_mentions_data = await User.findById(comment_mentions_ids[i], (err, data) => {
                    if(err){
                    } else {
                        return data;
                    }
                });
                comment_mentions_name_array.push(comment_mentions_data['full_name']);
            }
            const commented_by_id = comment._commented_by;
            const groupId = comment._post._group._id;
            const userData = await User.findById(commented_by_id, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const commented_by = userData['full_name'];
            const commented_by_profile_pic = userData['profile_pic'];
            const comment_content = JSON.parse(comment.content);
            const comment_object = {
                name: commented_by,
                text: `${commented_by} mentions ${comment_mentions_name_array} in his comment on post ${comment._post.title}`,
                image: commented_by_profile_pic,
                content: '\n',
                group_id: groupId,
                post_id: comment._post._id,
                btn_title:'view comment'
            }

            for(let i = 0; i < comment_mentions_ids.length; i++){
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                    data: JSON.stringify(comment_object),
                    userid:comment_mentions_ids[i]
                  });
                
                await helperFunctions.sendNotificationsFeedFromService(comment_mentions_ids[i], req.body.io, true);
            }

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

        const { postId, assigned_to, groupId, posted_by, io } = req.body;
        try {
            // Call Service Function for newEventAssignments
            await notificationService.newEventAssignments(postId, assigned_to, groupId, posted_by);
            
            await helperFunctions.sendNotificationsFeedFromService(assigned_to, io, true);
            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments Succeeded!`,
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

        const { postId, content_mentions, groupId, posted_by } = req.body;
        try {
            // Call Service function for newPostMentions
            await notificationService.newPostMentions(postId, content_mentions, groupId, posted_by);

            // Send status 200 response
            return res.status(200).json({
                message: 'New Post Mention Succeeded!'
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

        const { mention, file, user,io } = req.body;

        try {
            // Call Service function for newPostMentions
            await notificationService.newFolioMentions(file, user, mention);

            await helperFunctions.sendNotificationsFeedFromService(mention, io, true);
            
            // Send status 200 response
            return res.status(200).json({
                message: 'New Folio Mention Succeeded!'
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

        const { postId, assigned_to, groupId, posted_by,io } = req.body;
        try {
            // Call Service Function for newTaskAssignments
            await notificationService.newTaskAssignment(postId, assigned_to, groupId, posted_by);
            
            await helperFunctions.sendNotificationsFeedFromService(assigned_to, io,true);

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                userid:assigned_to,
                postId,
                assigneeId : assigned_to,
                _assigned_from: posted_by,
                type:"TASKASSIGNED"

              });
            // Send status 200 response
            return res.status(200).json({
                message: 'New Task Assignment Succeeded!'
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
        const { postId, assigneeId, _assigned_from , io} = req.body;
        try {
            
            // Call Service function for newTaskReassignment
            await notificationService.newTaskReassignment(postId, assigneeId, _assigned_from,io);

            await helperFunctions.sendNotificationsFeedFromService(assigneeId, io,true);

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                userid: assigneeId,
                postId,
                assigneeId,
                _assigned_from,
                type:"TASKASSIGNED"
              });

            // Send status 200 response
            return res.status(200).json({
                message: 'New Task Assignment Succeeded!'
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
        let { postId, assigned_to, userId, status, followers, posted_by, io } = req.body;
        
        try {
            status = (status == 'in progress') ? 'started' : 'completed';
            
            if (assigned_to) {
                const index = assigned_to.findIndex(assignee => assignee._id == posted_by);
                if (index < 0) {
                    await notificationService.taskStatusChanged(postId, status, userId, assigned_to, posted_by,req.body.io);
                    await helperFunctions.sendNotificationsFeedFromService(posted_by?._id, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                        userid: assigned_to,
                        postId, 
                        assigned_to, 
                        posted_by,
                        userId,
                        type:"STATUSCHANGED"
                      });
                }
                await notificationService.taskStatusChanged(postId, status, userId, assigned_to,null,req.body.io);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                    userid: userId,
                    postId, 
                    assigned_to,
                    userId,
                    type:"STATUSCHANGED"
                });
            }

            followers.forEach(async follower => {
                const index = assigned_to.findIndex(assignee => assignee._id == follower);
                if (index < 0 && follower !== posted_by) {
                    await notificationService.taskStatusChanged(postId, status, userId, null, followers,req.body.io);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                        userid: userId,
                        postId, 
                        follower,
                        userId,
                        type:"STATUSCHANGED"
                    });
                }
            });

            // Send status 200 response
            return res.status(200).json({
                message: 'New Task Status Change Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async newComment(req: Request, res: Response, next: NextFunction) {
        const { posted_by, assigned_to, followers,io } = req.body;
        try {
            const comment = JSON.parse(req.body.comment);
            // Call Service Function for newComment
            const commented_by = comment._commented_by._id;
            const postId = comment._post_id;

            
            await notificationService.newComment(comment, postId, posted_by);

            await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                postId,
                commented_by,
                posted_by,
                userid: posted_by,
                type:"COMMENTED"
              });

            if (assigned_to) {
                assigned_to.forEach(async assignee => {
                    await notificationService.newComment(comment, postId, assignee);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                        // data: JSON.stringify(comment_object),
                        postId,
                        commented_by,
                        posted_by,
                        userid: assignee,
                        type:"COMMENTED"
                    });
                });
            }
            if(followers) {
                followers.forEach(async follower => {
                    const index = assigned_to.findIndex(assignee => assignee === follower);
                    if (follower !== posted_by && index < 0) {
                        await notificationService.newComment(comment, postId, follower);
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                            // data: JSON.stringify(comment_object),
                            postId,
                            commented_by,
                            posted_by,
                            userid: follower,
                            type:"COMMENTED"
                        });
                    }
                });
            }
            // Send status 200 response
            return res.status(200).json({
                message: 'New Comment Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async followPost(req: Request, res: Response, next: NextFunction) {
        const { postId, posted_by, follower,io } = req.body;

        try {
            // Call Service Function for followPost
            await notificationService.followPost(postId, posted_by, follower);

            await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                // data: JSON.stringify(comment_object),
                userid:follower,
                postId, 
                posted_by, 
                follower,
                type:"FOLLOW"
              });

            // Send status 200 response
            return res.status(200).json({
                message: 'Post Followed Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async likePost(req: Request, res: Response, next: NextFunction) {
        const { postId, posted_by, followers, user, io } = req.body;

        try {
            // Call Service Function for likePost
            await notificationService.likePost(postId, posted_by, user);

            followers.forEach(async follower => {
                if (posted_by !== follower) {
                    await notificationService.likePost(postId, follower, user);
                }
            });

            await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                userid: user,
                postId, 
                posted_by,  
                user,
                type:"LIKE"
              });
            // Send status 200 response
            return res.status(200).json({
                message: 'Post Liked Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async likeComment(req: Request, res: Response, next: NextFunction) {
        const { comment, user, io } = req.body;
        try {
            const postId = req.body.comment._post._id;
            // Call Service Function for likeComment
            await notificationService.likeComment(comment, comment._commented_by, user);
            await helperFunctions.sendNotificationsFeedFromService(comment._commented_by, io, true);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                comment, 
                user,
                postId,
                userid: comment._commented_by,
                type:"LIKECOMMENT"
              });

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
                message: 'Comment Liked Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}
