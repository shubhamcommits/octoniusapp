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
        const commented_by = comment._commented_by._id;
        try {

            // Call Service Function for newCommentMentions
            
            await notificationService.newCommentMentions(comment).then(() => {
                return res.status(200).json({
                    message: `Comment Mentions Succeeded!`,
                });
            }).catch(err => {
                return sendError(res, new Error(err), 'Internal Server Error!', 500);
            });

            if (comment._content_mentions.includes('all')) {

                const userlist = await User.find({
                    _groups: comment._post._group._id
                }).distinct('_id');

                for (let index = 0; index < userlist.length; index++) {
                    const mentiond = userlist[index];
                    if(mentiond._id != commented_by){
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            userid: mentiond._id,
                            comment,
                            type:"COMMENTMENTION"
                        });
                    }
                    
                }

            } else {
            
                const comment_mentions_ids = comment._content_mentions;
                for(let i = 0; i < comment_mentions_ids.length; i++){
                    if(comment_mentions_ids[i] != commented_by){
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            userid: comment_mentions_ids[i],
                            comment,
                            type:"COMMENTMENTION"
                        });
                    }
                    
                    await helperFunctions.sendNotificationsFeedFromService(comment_mentions_ids[i], req.body.io, true);
                }
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


            if (content_mentions.includes('all')) {

                const userlist = await User.find({
                    _groups: groupId
                }).distinct('_id');

                for (let index = 0; index < userlist.length; index++) {
                    const mentiond = userlist[index];
                    if(mentiond._id != posted_by._id){
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            postId,
                            posted_by,
                            mentioned_all:true,
                            userid: mentiond._id,
                            type:"POSTMENTION"
                        });
                    }
                    
                }

            } else {
                for (let index = 0; index < content_mentions.length; index++) {
                    const mentiond = content_mentions[index];
                    if(mentiond !== posted_by._id){
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            postId,
                            posted_by,
                            mentioned_all:false,
                            userid: mentiond,
                            type:"POSTMENTION"
                        });
                    }
                }
            }

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

            if(assigned_to && assigned_to?.length > 0){
                await helperFunctions.sendNotificationsFeedFromService(assigned_to, io,true);
            }
             

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
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
            
            if(_assigned_from != assigneeId){
                // Call Service function for newTaskReassignment
                await notificationService.newTaskReassignment(postId, assigneeId, _assigned_from,io);

                await helperFunctions.sendNotificationsFeedFromService(assigneeId, io,true);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    userid: assigneeId,
                    postId,
                    assigneeId,
                    _assigned_from,
                    type:"TASKASSIGNED"
                  });            
            }
           

            // Send status 200 response
            return res.status(200).json({
                message: 'New Task Assignment Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };


    async taskStatusChanged(req: Request, res: Response, next: NextFunction) {
        let { postId, assigned_to, userId, status, followers, posted_by, io } = req.body;
        try {
            status = (status == 'in progress') ? 'started' : 'completed';
            await notificationService.taskStatusChanged(postId, status, userId, assigned_to,null,req.body.io);
            if (assigned_to && assigned_to?.length>0) {
                const index = assigned_to.findIndex(assignee => assignee._id == posted_by);
                if (index < 0) {
                    
                    assigned_to.forEach( async assignedTo => {
                        if(assignedTo._id !== userId){
                            await helperFunctions.sendNotificationsFeedFromService(assignedTo._id, io, true);
                            await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                                userid: assignedTo._id,
                                postId, 
                                assigned_to:assignedTo, 
                                userId,
                                type:"STATUSCHANGED"
                              });
                        }
                    });
                }
                
               
            }

            if(posted_by._id !== userId){
                await notificationService.taskStatusChanged(postId, status, userId, assigned_to, posted_by,req.body.io);
                await helperFunctions.sendNotificationsFeedFromService(posted_by?._id, io, true);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    userid: posted_by._id,
                    postId, 
                    assigned_to,
                    userId,
                    type:"STATUSCHANGED"
                });
            }

            followers.forEach(async follower => {
                const index = assigned_to.findIndex(assignee => assignee._id == follower);
                if (index < 0 && follower !== posted_by._id && follower !== userId) {
                    await notificationService.taskStatusChanged(postId, status, userId, null, followers,req.body.io);
                    await helperFunctions.sendNotificationsFeedFromService(follower, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: follower,
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

            if(posted_by != commented_by){
                await notificationService.newComment(comment, postId, posted_by);
                await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    postId,
                    commented_by,
                    posted_by,
                    userid: posted_by,
                    type:"COMMENTED"
                  });
            }
            
            if (assigned_to) {
                assigned_to.forEach(async assignee => {
                    await notificationService.newComment(comment, postId, assignee);
                    await helperFunctions.sendNotificationsFeedFromService(assignee, io, true);
                    if(assignee != commented_by){
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            // data: JSON.stringify(comment_object),
                            postId,
                            commented_by,
                            posted_by,
                            userid: assignee,
                            type:"COMMENTED"
                        });
                    }
                    
                });
            }
            if(followers) {
                followers.forEach(async follower => {
                    const index = assigned_to.findIndex(assignee => assignee === follower);
                    if (follower !== posted_by && index < 0) {
                        await notificationService.newComment(comment, postId, follower);
                        await helperFunctions.sendNotificationsFeedFromService(follower, io, true);
                        if(follower != commented_by){
                            await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                                // data: JSON.stringify(comment_object),
                                postId,
                                commented_by,
                                posted_by,
                                userid: follower,
                                type:"COMMENTED"
                            });
                        }   
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
        const { postId, posted_by, assigned_to, groupId, mentions, follower,io } = req.body;

        try {
            // Call Service Function for followPost
            
            if(posted_by !== follower){
                await notificationService.followPost(postId, posted_by, follower);
                await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    userid:posted_by,
                    postId, 
                    posted_by, 
                    follower,
                    type:"FOLLOW"
                });
            }

              assigned_to.forEach(async assignee => {
                if (posted_by !== assignee && assignee !== follower) {
                    await notificationService.likePost(postId, assignee, follower);
                    await helperFunctions.sendNotificationsFeedFromService(assignee, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: assignee,
                        postId, 
                        posted_by, 
                        follower,
                        type:"FOLLOW"
                      });
                }
            });

            if (mentions.includes('all')) {

                const userlist = await User.find({
                    _groups: groupId
                }).distinct('_id');

                for (let index = 0; index < userlist.length; index++) {
                    const mentiond = userlist[index];
                    if(mentiond._id !== follower && mentiond._id !== posted_by){
                        await notificationService.likePost(postId, mentiond, follower);
                        await helperFunctions.sendNotificationsFeedFromService(mentiond, io, true);
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            // data: JSON.stringify(comment_object),
                            userid: mentiond,
                            postId, 
                            posted_by, 
                            follower,
                            type:"FOLLOW"
                          });
                    } 
                }

            } else {
                for (let index = 0; index < mentions.length; index++) {
                    const mentiond = mentions[index];
                    if(mentiond !== follower && mentiond !== posted_by){
                        await notificationService.likePost(postId, mentiond._id, follower);
                        await helperFunctions.sendNotificationsFeedFromService(mentiond._id, io, true);
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            userid:mentiond._id,
                            postId, 
                            posted_by, 
                            follower,
                            type:"FOLLOW"
                          });
                    } 
                    
                }
            }

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

        const { postId, posted_by,groupId, followers, user,assigned_to,mentions, io } = req.body;

        try {
            // Call Service Function for likePost

            followers.forEach(async follower => {
                if (posted_by !== follower && follower !== user) {
                    await notificationService.likePost(postId, follower, user);
                    await helperFunctions.sendNotificationsFeedFromService(follower, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: follower,
                        postId, 
                        posted_by,  
                        user,
                        type:"LIKE"
                    });
                }
            });

            assigned_to.forEach(async assignee => {
                if (posted_by !== assignee && assignee !== user) {
                    await notificationService.likePost(postId, assignee, user);
                    await helperFunctions.sendNotificationsFeedFromService(assignee, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: assignee,
                        postId, 
                        posted_by,  
                        user,
                        type:"LIKE"
                    });
                }
            });

            if (mentions.includes('all')) {

                const userlist = await User.find({
                    _groups: groupId
                }).distinct('_id');

                for (let index = 0; index < userlist.length; index++) {
                    const mentiond = userlist[index];
                    if(mentiond !== user && mentiond !== posted_by){
                        await notificationService.likePost(postId, mentiond, user);
                        await helperFunctions.sendNotificationsFeedFromService(mentiond, io, true);
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            userid: mentiond,
                            postId, 
                            posted_by,  
                            user,
                            type:"LIKE"
                        });
                    } 
                }

            } else {
                for (let index = 0; index < mentions.length; index++) {
                    const mentiond = mentions[index];
                    if(mentiond._id !== user && mentiond._id !== posted_by){
                        await notificationService.likePost(postId, mentiond._id, user);
                        await helperFunctions.sendNotificationsFeedFromService(mentiond._id, io, true);
                        await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            userid: mentiond._id,
                            postId, 
                            posted_by,  
                            user,
                            type:"LIKE"
                        });
                    } 
                    
                }
            }

            
            
            if(posted_by !== user) {

                await notificationService.likePost(postId, posted_by, user);
                await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    userid: posted_by,
                    postId, 
                    posted_by,  
                    user,
                    type:"LIKE"
                });
            }
            
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
            
            if(user !== comment._commented_by){
                await notificationService.likeComment(comment, comment._commented_by, user);
                await helperFunctions.sendNotificationsFeedFromService(comment._commented_by, io, true);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    comment, 
                    user,
                    postId,
                    userid: comment._commented_by,
                    type:"LIKECOMMENT"
                });    
            }
            
            let index:any;
            if(comment._post?._assigned_to){
                index = comment._post._assigned_to.findIndex(assignee => assignee === comment._commented_by);
                if (comment._post._posted_by && index < 0) {
                    await notificationService.likeComment(comment, comment._post._posted_by, user);
                    await helperFunctions.sendNotificationsFeedFromService(comment._post._posted_by, io, true);

                }
            }


            if(comment._post?._followers){
                comment._post._followers.forEach(async follower => {
                    if(comment._post._assigned_to){
                        index = comment._post._assigned_to.findIndex(assignee => assignee === follower);
                        if (index < 0 && follower !== comment._commented_by) {
                            await notificationService.likeComment(comment, follower, user);
                            await helperFunctions.sendNotificationsFeedFromService(follower, io, true);

                        }
                    }
                });
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Comment Liked Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This route is responsible for notifying the user on mention on new post
     * @param { postId, groupId, posted_by, io } post 
     */
    async newPost(req: Request, res: Response, next: NextFunction) {

        const { postId, groupId, posted_by, io } = req.body;
        try {
            // Call Service Function for newEventAssignments
            await notificationService.newPost(postId, groupId, posted_by, io);

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
     * This route is responsible for notifying the user he/she is added to a group
     * @param { userId, groupId, posted_by, io } post 
     */
    async joinGroup(req: Request, res: Response, next: NextFunction) {

        const { userId, groupId, added_by, io } = req.body;
        try {
            // Call Service Function for newEventAssignments
            await notificationService.joinGroup(userId, groupId, added_by, io);

            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments Succeeded!`,
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };
}
