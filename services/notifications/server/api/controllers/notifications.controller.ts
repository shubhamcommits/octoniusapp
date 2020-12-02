import { Notification, Post, User } from "../models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";
import { NotificationsService } from "../service";
import { sendErr } from "../../utils/sendError";
import { validateId } from "../../utils/helperFunctions";
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

        const { comment } = req.body;

        console.log('req.body', req.body);
        try {

            // Call Service Function for newCommentMentions
            await notificationService.newCommentMentions(comment).then(() => {
                return res.status(200).json({
                    message: `Comment Mentions succeded!`,
                });
            }).catch(err => {
                return sendError(res, new Error(err), 'Internal Server Error!', 500);
            });
            
            const commented_by_id = req.body.comment._commented_by;
            const userData = await User.findById(commented_by_id, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    return data;
                }
            });
            const commented_by = userData['full_name'];
            console.log('Commented By ==>', commented_by);
            const comment_content = JSON.parse(comment.content);
            console.log('comment_content ==>', comment_content.ops[0].insert);
            const comment_object = {
                name: commented_by,
                text: commented_by + ' mentioned you on ' + comment._post.title,
                image: comment._commented_by.profile_pic,
                content: '\n',
                btn_title:'view comment'
            }
            console.log('comment_object ==>', comment_object);

            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid:commented_by_id
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

        console.log('newEventAssignments function');
        const { postId, assigned_to, groupId, posted_by } = req.body;
        try {
            // Call Service Function for newEventAssignments
            await notificationService.newEventAssignments(postId, assigned_to, groupId, posted_by);

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

        const { postId, content_mentions, groupId, posted_by } = req.body;
        try {
            console.log('newPostMentions');
            // Call Service function for newPostMentions
            await notificationService.newPostMentions(postId, content_mentions, groupId, posted_by);

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

        console.log('newFolioMentionFunction');
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

        const { postId, assigned_to, groupId, posted_by } = req.body;
        try {
            console.log('newTaskAssignment function');
            console.log('req.body ==>', req.body);
            // Call Service Function for newTaskAssignments
            await notificationService.newTaskAssignment(postId, assigned_to, groupId, posted_by);
            
            const postData = await Post.findById(postId, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    // console.log('post document ==> ', data);
                    return data;
                }
            });
            const postTitle = postData['title'];
            console.log('postTitle ==>', postTitle);
            const postedBy = posted_by.first_name + ' ' + posted_by.last_name;
            console.log('Posted By ==>', postedBy);
            const comment_object = {
                name: postedBy,
                text: `${postedBy} assigned you on ${postTitle}`,
                image: posted_by.profile_pic,
                content: '\n ',
                btn_title:'view task'
            }
            console.log('comment_object ==>', comment_object);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid:posted_by._id
              });
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
        const { postId, assigneeId, posted_by } = req.body;
        console.log('newTaskReassignment function');
        console.log(
            'req.body ==>', req.body,
            '\nassigned_by ==>', assigneeId,
            '\npostId ==>', postId,
            '\nposted_by ==>', posted_by
        )
        try {
            
            // Call Service function for newTaskReassignment
            await notificationService.newTaskReassignment(postId, assigneeId, posted_by);

            const postData = await Post.findById(postId, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    // console.log('post document ==> ', data);
                    return data;
                }
            });
            const postTitle = postData['title'];
            console.log('postTitle ==>', postTitle);
            const postedBy = posted_by.first_name + ' ' + posted_by.last_name;
            console.log('Posted By ==>', postedBy);
            const comment_object = {
                name: postedBy,
                text: `${postedBy} reassigned you ${postTitle}`,
                image: posted_by.profile_pic,
                content: '\n ',
                btn_title:'view task'
            }
            console.log('comment_object ==>', comment_object);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid: assigneeId
              });

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
        console.log('taskStatusChanged function');
        console.log('req.body ==>', req.body);
        let { postId, assigned_to, userId, status, followers, posted_by } = req.body;
        
        try {
            status = (status == 'in progress') ? 'started' : 'completed';
            
            if (assigned_to) {
                const index = assigned_to.findIndex(assignee => assignee._id == posted_by);
                if (index < 0) {
                    await notificationService.taskStatusChanged(postId, status, userId, assigned_to, posted_by);
                }
                await notificationService.taskStatusChanged(postId, status, userId, assigned_to);
            }

            followers.forEach(async follower => {
                const index = assigned_to.findIndex(assignee => assignee._id == follower);
                if (index < 0 && follower !== posted_by) {
                    await notificationService.taskStatusChanged(postId, status, userId, null, followers);
                }
            });

            const postedBy = posted_by.first_name + ' ' + posted_by.last_name;
            console.log('Posted By ==>', postedBy);
            const comment_object = {
                name: postedBy,
                text: 'Your task assignment status changed by ' + postedBy,
                image: posted_by.profile_pic,
                content: '\n ',
                btn_title:'view task'
            }
            console.log('comment_object ==>', comment_object);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid: userId
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
        console.log('newComment Function');
        console.log('req.body of newComment ==>', req.body);
        const { comment, posted_by, assigned_to, followers } = req.body;
        try {
            // Call Service Function for newComment
            const commented_by = req.body.comment._commented_by._id;
            console.log('Commented By ==>', commented_by)
            await notificationService.newComment(comment, posted_by);

            const userData = await User.findById(commented_by, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    return data;
                }
            });

            const userFullName = userData['full_name'];
            const comment_content = JSON.parse(comment.content);
            console.log('comment_content ==>', comment_content.ops[0].insert);
            const comment_object = {
                name: userFullName,
                text: userFullName + ' commented on ' + comment._post.title,
                image: comment._commented_by.profile_pic,
                content: '\n',
                btn_title:'view comment'
            }
            console.log('comment_object ==>', comment_object);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid: commented_by
              });
            if (assigned_to) {
                assigned_to.forEach(async assignee => {
                    await notificationService.newComment(comment, assignee); 
                });
            }
            if(followers) {
                followers.forEach(async follower => {
                    const index = assigned_to.findIndex(assignee => assignee === follower);
                    if (follower !== posted_by && index < 0) {
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
        const { postId, posted_by, follower } = req.body;

        console.log('followPost function');
        try {
            console.log('req.body ==>', req.body);
            // Call Service Function for followPost
            await notificationService.followPost(postId, posted_by, follower);
            
            const postData = await Post.findById(postId, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    // console.log('post document ==> ', data);
                    return data;
                }
            });
            const userData = await User.findById(follower, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    return data;
                }
            });

            const postTitle = postData['title'];
            const followerName = userData['full_name'];

            const comment_object = {
                name: followerName,
                text: `${followerName} follows ${postTitle} `,
                image: '\n',
                content: '\n ',
                btn_title:'view post'
            }
            console.log('comment_object ==>', comment_object);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid:follower
              });

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
        console.log('followPost function');
        console.log('req.body ==>', req.body);
        const { postId, posted_by, followers, user } = req.body;
        const postData = await Post.findById(postId, (err, data) => {
            if(err){
                console.log('db error ==>', err);
            } else {
                return data;
            }
        });
        const userData = await User.findById(user, (err, data) => {
            if(err){
                console.log('db error ==>', err);
            } else {
                return data;
            }
        });
        
        const postObject = postData.toObject();
        console.log('postData title ==>', postObject.title);

        const userObject = userData.toObject();
        console.log('user full name ==>', userObject.full_name);
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
                text: `${userObject.full_name} likes ${postObject.title}`,
                image: '\n',
                content: '\n ',
                btn_title:'view post'
            }
            console.log('comment_object ==>', comment_object);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid: user
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
            console.log('likeComment');
            console.log('req.body ==>', req.body);
            console.log('liked_by ==>', req.body.user);
            console.log('post ==>', req.body.comment._post._id);
            // Call Service Function for likeComment
            await notificationService.likeComment(comment, comment._commented_by, user);

            const postData = await Post.findById(req.body.comment._post._id, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    // console.log('post document ==> ', data);
                    return data;
                }
            });
            const userData = await User.findById(req.body.user, (err, data) => {
                if(err){
                    console.log('db error ==>', err);
                } else {
                    return data;
                }
            });
            const postTitle = postData['title'];
            const userFullName = userData['full_name'];

            const comment_object = {
                name: userFullName,
                text: `${userFullName} liked your comment ${postTitle}`,
                image: '\n',
                content: '\n ',
                btn_title:'view post'
            }
            console.log('comment_object ==>', comment_object);
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/slack-notify`, {
                data: comment_object,
                userid: req.body.user
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
                message: 'Comment Liked Succeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}
