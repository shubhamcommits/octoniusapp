import { Post, User } from "../models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";
import { NotificationsService } from "../service";
import { sendErr } from "../../utils/sendError";
import { helperFunctions } from '../../utils';
import axios from 'axios';
import { Readable } from 'stream';

// Creating Service class in order to build wrapper class
const notificationService = new NotificationsService();

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
        const userId = req.body.userId;
        try {
            let notifyTo = [];

            if (comment._content_mentions.includes('all')) {
                const userlist = await User.find({
                    _groups: comment._post._group._id
                }).distinct('_id');

                notifyTo = notifyTo.concat(userlist);

            } else {
                notifyTo = notifyTo.concat(comment._content_mentions);
            }

            let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
            await stream.on('data', async (nt: any) => {
                if (nt._id != userId) {
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            userid: (nt._id || nt),
                            comment,
                            type: "COMMENTMENTION"
                        });

                    await helperFunctions.sendNotificationsFeedFromService((nt._id || nt), req.body.io, true);
                    
                    await notificationService.newCommentMentions(userId, (nt._id || nt), comment._id, comment._post).then(() => {
                        return res.status(200).json({
                            message: `Comment Mentions Succeeded!`,
                        });
                    }).catch(err => {
                        return sendError(res, new Error(err), 'Internal Server Error!', 500);
                    });
                }
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

        const { postId, assigned_to, groupId, posted_by, userId, io } = req.body;
        try {
            // Call Service Function for newEventAssignments
            await notificationService.newEventAssignments(postId, assigned_to, groupId, posted_by, userId);

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

        const { postId, content_mentions, groupId, posted_by, userId } = req.body;
        try {

            let notifyTo = [];

            if (content_mentions.includes('all')) {
                const userlist = await User.find({
                    _groups: groupId
                }).distinct('_id');

                notifyTo = notifyTo.concat(userlist);
            } else {
                notifyTo = notifyTo.concat(content_mentions);
            }

            let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
            await stream.on('data', async (nt: any) => {
                if ((nt._id || nt) != userId) {
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                            postId,
                            posted_by,
                            mentioned_all: content_mentions.includes('all'),
                            userid: (nt._id || nt),
                            type: "POSTMENTION"
                        });

                    // Call Service function for newPostMentions
                    await notificationService.newPostMentions(userId, (nt._id || nt), postId);
                }
            });

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

        const { mention, file, user, io } = req.body;

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

        const { postId, assigned_to, groupId, posted_by, userId, io } = req.body;
        try {
            // Let usersStream
            let notyfyTo: any;

            // If all members are selected
            if (assigned_to.includes('all')) {
                // Create Readble Stream from the Event Assignee
                notyfyTo = Readable.from(await User.find({
                    _groups: groupId
                }).select('_workspace first_name email integrations.firebase_token'))
            } else {
                // Create Readble Stream from the Event Assignee
                notyfyTo = Readable.from(assigned_to);
            }

            await notyfyTo.on('data', async (nt: any) => {
                if ((nt._id || nt) !== userId) {
                    // Call Service Function for newTaskAssignments
                    await notificationService.newTaskAssignment(postId, (nt._id || nt), userId);

                    if (assigned_to && assigned_to?.length > 0) {
                        await helperFunctions.sendNotificationsFeedFromService((nt._id || nt), io, true);
                    }

                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: (nt._id || nt),
                        postId,
                        assigneeId: (nt._id || nt),
                        _assigned_from: userId,
                        type: "TASKASSIGNED"
                    });
                }
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
        const { postId, assigneeId, _assigned_from, io } = req.body;
        try {
            if (_assigned_from != assigneeId) {
                // Call Service function for newTaskReassignment
                await notificationService.newTaskReassignment(postId, assigneeId, _assigned_from, io);

                await helperFunctions.sendNotificationsFeedFromService(assigneeId, io, true);
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    userid: assigneeId,
                    postId,
                    assigneeId,
                    _assigned_from,
                    type: "TASKASSIGNED"
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
        let { postId, userId, assigned_to, status, followers, posted_by, io } = req.body;
        // let userId = req['userId'];
        try {
            status = (status == 'in progress') ? 'started' : 'completed';

            let notifyTo = [];
            notifyTo.push(posted_by);
            notifyTo = notifyTo.concat(followers);
            if (assigned_to && assigned_to?.length > 0) {
                notifyTo = notifyTo.concat(assigned_to);
            }

            let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
            await stream.on('data', async (nt: any) => {
                if ((nt._id || nt) != userId) {
                    await notificationService.taskStatusChanged(postId, status, userId, (nt._id || nt), req.body.io);
                    await helperFunctions.sendNotificationsFeedFromService(nt, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: userId,
                        postId,
                        nt,
                        type: "STATUSCHANGED"
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
        const { posted_by, assigned_to, followers, userId, io } = req.body;
        try {
            const comment = JSON.parse(req.body.comment);
            // Call Service Function for newComment
            const commented_by = comment._commented_by._id;
            const postId = comment._post_id;

            let notifyTo = [];
            notifyTo.push(posted_by);

            if (!!assigned_to) {
                notifyTo = notifyTo.concat(assigned_to);
            }

            if (followers) {
                notifyTo = notifyTo.concat(followers);
            }

            let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
            await stream.on('data', async (nt: any) => {
                if (nt._id != commented_by) {
                    await notificationService.newComment(comment, postId, userId, (nt._id || nt));
                    await helperFunctions.sendNotificationsFeedFromService(nt, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        postId,
                        commented_by,
                        posted_by,
                        userid: (nt._id || nt),
                        type: "COMMENTED"
                    });
                }
            });

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
        const { postId, posted_by, assigned_to, groupId, mentions, userId, io } = req.body;

        try {
            // Call Service Function for followPost
            let notifyTo = [];
            notifyTo.push(userId);

            if (!!assigned_to) {
                notifyTo = notifyTo.concat(assigned_to);
            }

            if (mentions.includes('all')) {
                notifyTo = notifyTo.concat(await User.find({
                        _groups: groupId
                    }).distinct('_id'));
            } else {
                notifyTo = notifyTo.concat(mentions);
            }

            let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
            await stream.on('data', async (nt: any) => {
                if ((nt._id || nt) != userId) {
                    await notificationService.followPost(postId, (nt._id || nt), userId);
                    await helperFunctions.sendNotificationsFeedFromService(posted_by, io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: posted_by,
                        postId,
                        posted_by,
                        userId,
                        type: "FOLLOW"
                    });
                }
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

        const { postId, posted_by, groupId, followers, user, assigned_to, mentions, io } = req.body;

        try {
            // Call Service Function for likePost
            let notifyTo = [];
            notifyTo.push(posted_by);

            if (!!followers) {
                notifyTo = notifyTo.concat(assigned_to);
            }

            if (!!assigned_to) {
                notifyTo = notifyTo.concat(assigned_to);
            }

            if (mentions.includes('all')) {
                notifyTo = notifyTo.concat(await User.find({
                        _groups: groupId
                    }).distinct('_id'));
            } else {
                notifyTo = notifyTo.concat(mentions);
            }

            let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
            await stream.on('data', async (nt: any) => {
                if ((nt._id || nt) != user) {
                    await notificationService.likePost(postId, (nt._id || nt), user);
                    await helperFunctions.sendNotificationsFeedFromService((nt._id || nt), io, true);
                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        userid: (nt._id || nt),
                        postId,
                        posted_by,
                        user,
                        type: "LIKE"
                    });
                }
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

            let notifyTo = [];
            notifyTo.push(comment._commented_by);

            if (!!comment._post?._followers) {
                notifyTo = notifyTo.concat(comment._post?._followers);
            }

            if (!!comment._post._assigned_to) {
                notifyTo = notifyTo.concat(comment._post._assigned_to);
            }

            let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
            await stream.on('data', async (nt: any) => {
                if ((nt._id || nt) != user) {
                    await notificationService.likeComment(comment, (nt._id || nt), user);

                    await helperFunctions.sendNotificationsFeedFromService(comment._commented_by, io, true);

                    await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                        comment,
                        user,
                        postId,
                        userid: (nt._id || nt),
                        type: "LIKECOMMENT"
                    });
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

    /**
     * This route is responsible for notifying the user on mention on new post
     * @param { postId, groupId, posted_by, io } post 
     */
    async newPost(req: Request, res: Response, next: NextFunction) {

        const { postId, groupId, userId, io } = req.body;
        try {
            // Call Service Function for newEventAssignments
            await notificationService.newPost(postId, groupId, userId, io);

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
     * This route is responsible for notifying the user a post was edited
     * @param { postId, groupId, posted_by, io } post 
     */
    async postEdited(req: Request, res: Response, next: NextFunction) {

        const { postId, groupId, userId, io } = req.body;
        try {
console.log(postId);
console.log(groupId);
console.log(userId);
            const post = await Post.findById(postId).select('type _posted_by').lean();
console.log(post);
            let notifyTo = [];
            if (!!post && post.type == 'post') {
                // Let usersStream
                notifyTo = await User.find({
                    _groups: groupId
                }).select('_workspace first_name email integrations.firebase_token');
            } else if (!!post && post.type == 'task') {
                notifyTo.push(post._posted_by);

                if (!!post._assigned_to) {
                    notifyTo = notifyTo.concat(post._assigned_to);
                }

                if (!!post._followers) {
                    notifyTo = notifyTo.concat(post._followers);
                }

                if (!!post._content_mentions) {
                    if (post._content_mentions.includes('all')) {
                        const userlist = await User.find({
                            _groups: groupId
                        }).distinct('_id');

                        notifyTo = notifyTo.concat(userlist);

                    } else {
                        notifyTo = notifyTo.concat(post._content_mentions);
                    }
                }

                notifyTo = await helperFunctions.removeDuplicates(notifyTo, '_id');
            }
console.log(notifyTo);
            if (!!notifyTo) {
console.log(notifyTo);
                let stream = Readable.from(await helperFunctions.removeDuplicates(notifyTo, '_id'));
                await stream.on('data', async (nt: any) => {
                    if ((nt._id || nt) != userId) {
                        // Call Service Function for newEventAssignments
                        await notificationService.postEdited(postId, groupId, userId, (nt._id || nt), io);
                    }
                });
            }

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
            // Call Service Function for joining a group
            await notificationService.joinGroup(userId, groupId, added_by, io);

            // Add notification on integrations
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                groupId,
                userId,
                addedBy: added_by,
                type: "JOINGROUP"
            });

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
     * This function is responsible for notifying the user is removed from a groups
     * @param { userId, groupId, posted_by, io } post 
     */
    async leaveGroup(req: Request, res: Response, next: NextFunction) {

        const { userId, groupId, removed_by, io } = req.body;
        try {
            // Call Service Function for leaving the group
            await notificationService.leaveGroup(userId, groupId, removed_by, io);

            // Add notification on integrations
            await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                groupId,
                userId,
                removedBy: removed_by,
                type: "LEAVEGROUP"
            });

            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments Succeeded!`,
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for notifying the users when an item was approved by every member in the flow
     * @param { userId, groupId, posted_by, io } post 
     */
    async shuttleTask(req: Request, res: Response, next: NextFunction) {

        let { postId, userId, groupId, shuttleGroupId, io } = req.body;
        try {
            await notificationService.shuttleTask(postId, userId, groupId, shuttleGroupId, io);

            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments Succeeded!`,
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for returning all users unread notifications for the inbox
     */
    async inboxNotifications(req: Request, res: Response, next: NextFunction) {

        try {
            const { workspaceId } = req.params;
            const userId = req['userId'];

            // If storyId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId || !userId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId and a userId as the query parameter!'
                })
            }

            const limit = 5;

            const unreadNotifications = await notificationService.getUnread(userId, limit);
            const countUnreadNotificationsTotal = (await notificationService.getUnread(userId)).length;
            const unreadPosts = await notificationService.getNewPost(userId, limit);
            const totalUnreadPostsCount = (await notificationService.getNewPost(userId)).length;
            const pendingApprovals = await notificationService.getPendingApprovals(userId, limit);
            const totalUnreadApprovalsCount = (await notificationService.getPendingApprovals(userId)).length;
            const attendingEvents = await notificationService.getAttendingEvents(workspaceId, userId, limit);
            const totalUnreadEventsCount = (await notificationService.getAttendingEvents(workspaceId, userId)).length;

            // Send status 200 response
            return res.status(200).json({
                message: `Notifications Obtained!`,
                unreadNotifications: unreadNotifications,
                countUnreadNotificationsTotal: countUnreadNotificationsTotal,
                unreadPosts: unreadPosts,
                totalUnreadPostsCount: totalUnreadPostsCount,
                pendingApprovals: pendingApprovals,
                totalUnreadApprovalsCount: totalUnreadApprovalsCount,
                attendingEvents: attendingEvents,
                totalUnreadEventsCount: totalUnreadEventsCount
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for returning the users unread notifications
     */
    async unread(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        try {
            if (!userId) {
                return sendErr(res, new Error('Please provide a userId!'), 'Please provide a userId!', 500);
            }

            const notifications = await notificationService.getUnread(userId);

            // Send status 200 response
            return res.status(200).json({
                message: `Notifications Obtained!`,
                notifications: notifications
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for returning the users unread notifications
     */
    async unreadPosts(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        try {
            if (!userId) {
                return sendErr(res, new Error('Please provide a userId!'), 'Please provide a userId!', 500);
            }

            const unreadPosts = await notificationService.getNewPost(userId);

            // Send status 200 response
            return res.status(200).json({
                message: `New Posts Obtained!`,
                unreadPosts: unreadPosts
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for returning the users unread notifications
     */
    async pendingApprovals(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        try {
            if (!userId) {
                return sendErr(res, new Error('Please provide a userId!'), 'Please provide a userId!', 500);
            }

            const pendingApprovals = await notificationService.getPendingApprovals(userId);

            // Send status 200 response
            return res.status(200).json({
                message: `Pending Approvals Obtained!`,
                pendingApprovals: pendingApprovals
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async saveFirebaseToken(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];
        const token = req.body.token;

        try {
            if (!userId || !token) {
                return sendErr(res, new Error('Please provide userId & token!'), 'Please provide userId & token!', 500);
            }

            const user = await User.findByIdAndUpdate({ _id: userId }, {
                    $set: {
                        'integrations.firebase_token': token
                    }
                },
                { new: true }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: `Firebase Token Saved!`,
                user: user
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for notifying the user on mention on a Collection
     * @param file
     * @param user
     * @param mention
     */
    async newCollectionMention(req: Request, res: Response, next: NextFunction) {

        const { mentions, collectionId, userId, io } = req.body;

        try {
            await notificationService.newCollectionMentions(userId, collectionId, mentions, io);

            // Send status 200 response
            return res.status(200).json({
                message: 'New Collection Mention Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for notifying the user on mention on a Page
     * @param file
     * @param user
     * @param mention
     */
    async newPageMention(req: Request, res: Response, next: NextFunction) {

        const { mentions, pageId, userId, io } = req.body;

        try {
            await notificationService.newPageMentions(userId, pageId, mentions, io);

            // Send status 200 response
            return res.status(200).json({
                message: 'New Page Mention Succeeded!'
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

}
