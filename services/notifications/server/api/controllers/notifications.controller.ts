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
            const postData = await Post.findById(postId, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const userData = await User.findById(assigned_to, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const postedByData = await User.findById(posted_by, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const postTitle = postData['title'];
            const assignedToFullName = userData['full_name'];
            const postedByFullName = postedByData['full_name'];
            const postedByProfilePic = postedByData['profile_pic'];
            const comment_object = {
                name: postedByFullName,
                text: `${postedByFullName} assigned ${assignedToFullName} on ${postTitle}`,
                image: postedByProfilePic,
                content: '\n ',
                group_id: groupId,
                post_id: postId,
                btn_title:'view task'
            }
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: JSON.stringify(comment_object),
                userid:assigned_to
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

            const postData = await Post.findById(postId, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const userData = await User.findById(assigneeId, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const assigneeFromData = await User.findById(_assigned_from, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const assigneFromFullName = assigneeFromData['full_name'];
            const assigneFromProfilePic = assigneeFromData['profile_pic'];
            const assignedToFullName = userData['full_name'];
            const postTitle = postData['title'];
            const groupId = postData['_group'];
            const comment_object = {
                name: assigneFromFullName,
                text: `${assigneFromFullName} assigned ${assignedToFullName} on post ${postTitle}`,
                image: assigneFromProfilePic,
                group_id:groupId,
                post_id: postId,
                content: '\n ',
                btn_title:'view task'
            }
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: JSON.stringify(comment_object),
                userid: assigneeId
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
                }
                await notificationService.taskStatusChanged(postId, status, userId, assigned_to,null,req.body.io);
            }

            followers.forEach(async follower => {
                const index = assigned_to.findIndex(assignee => assignee._id == follower);
                if (index < 0 && follower !== posted_by) {
                    await notificationService.taskStatusChanged(postId, status, userId, null, followers,req.body.io);
                }
            });

            const postData = await Post.findById(postId, { _group: 1, title: 1 });
            const userAssignedData = await User.findById(assigned_to, { full_name: 1 });
            const userData = await User.findById(userId, {full_name: 1, profile_pic: 1});
            const userFullName = userData['full_name'];
            const userProfilePic = userData['profile_pic'];
            const groupId = postData['_group'];
            const postTitle = postData['title'];
            var notification_text = '';
            if(assigned_to && userAssignedData){
                const userAssignedFullName = userAssignedData['full_name'];
                notification_text = `${userAssignedFullName}'s assignment status changed by ${userFullName} on post ${postTitle} `;
            } else {
                notification_text = `${postTitle} post status changed by ${userFullName}`;
            }
            const comment_object = {
                name: userFullName,
                text: notification_text,
                image: userProfilePic,
                content: '\n ',
                group_id: groupId,
                post_id: postId,
                btn_title:'view task'
            }
            if( assigned_to && userAssignedData ){
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                    data: JSON.stringify(comment_object),
                    userid: assigned_to
                  });
            }
            if( userId ) {
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                    data: JSON.stringify(comment_object),
                    userid: userId
                  });
            }

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

            const postData = await Post.findById({ _id: postId }, { _group:1, title:1 });
            await notificationService.newComment(comment, postId, posted_by);
            const userData = await User.findById({_id: commented_by}, {full_name:1, profile_pic:1});
            const postUserData = await User.findById({_id: posted_by}, {full_name:1});

            const groupId = postData['_group'];
            const title = postData['title'];
            const postUserFullName = postUserData['full_name'];
            const userFullName = userData['full_name'];
            const userProfilePic = userData['profile_pic'];
            const comment_object = {
                name: userFullName,
                text: `${userFullName} commented on ${postUserFullName}'s ${title}`,
                image: userProfilePic,
                content: '\n ',
                group_id: groupId,
                post_id: postId,
                btn_title:'view comment'
            }
            await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: JSON.stringify(comment_object),
                userid: posted_by
              });
            if (assigned_to) {
                assigned_to.forEach(async assignee => {
                    await notificationService.newComment(comment, postId, assignee);
                });
            }
            if(followers) {
                followers.forEach(async follower => {
                    const index = assigned_to.findIndex(assignee => assignee === follower);
                    if (follower !== posted_by && index < 0) {
                        await notificationService.newComment(comment, postId, follower);
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
            
            const postData = await Post.findById(postId, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const userData = await User.findById(follower, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const postUserData = await User.findById(posted_by, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
    
            const postUserFullName = postUserData['full_name'];

            const postTitle = postData['title'];
            const groupId = postData['_group'];
            const followerName = userData['full_name'];
            const profile_img = userData['profile_pic'];

            const comment_object = {
                name: followerName,
                text: `${followerName} follows ${postUserFullName}'s post ${postTitle} `,
                image: profile_img,
                content: '\n ',
                group_id: groupId,
                post_id: postId,
                btn_title:'view post'
            }
            await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: JSON.stringify(comment_object),
                userid:follower
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
        const postData = await Post.findById(postId, (err, data) => {
            if(err){
            } else {
                return data;
            }
        });
        const userData = await User.findById(user, (err, data) => {
            if(err){
            } else {
                return data;
            }
        });
        const postUserData = await User.findById(posted_by, (err, data) => {
            if(err){
            } else {
                return data;
            }
        });

        const postUserFullName = postUserData['full_name'];
        const postObject = postData.toObject();

        const userObject = userData.toObject();
        try {
            // Call Service Function for likePost
            await notificationService.likePost(postId, posted_by, user);

            followers.forEach(async follower => {
                if (posted_by !== follower) {
                    await notificationService.likePost(postId, follower, user);
                }
            });

            const comment_object = {
                name: userObject.full_name,
                text: `${userObject.full_name} likes ${postUserFullName}'s post ${postObject.title}`,
                image: userObject.profile_pic,
                content: '\n ',
                group_id: postObject._group,
                post_id: postId,
                btn_title:'view post'
            }
            await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: JSON.stringify(comment_object),
                userid: user
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

            const postData = await Post.findById(postId, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const userData = await User.findById(req.body.user, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const commentedByUser = await User.findById(comment._commented_by, (err, data) => {
                if(err){
                } else {
                    return data;
                }
            });
            const postTitle = postData['title'];
            const groupId = postData['_group'];
            const userFullName = userData['full_name'];
            const commentedByUserFullName = commentedByUser['full_name'];
            const profile_pic = userData['profile_pic'];
            const comment_object = {
                name: userFullName,
                text: `${userFullName} likes ${commentedByUserFullName}'s comment on ${postTitle}`,
                image: profile_pic,
                content: '\n ',
                groupId: groupId,
                post_id: postId,
                btn_title:'view post'
            }
            await helperFunctions.sendNotificationsFeedFromService(comment._commented_by, io, true);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: JSON.stringify(comment_object),
                userid: comment._commented_by
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
