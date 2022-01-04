import { Notification, User, File, Workspace } from "../models";
import { Readable } from 'stream';
import { helperFunctions, axios } from '../../utils';

/*  ===============================
 *  -- NOTIFICATIONS Service --
 *  ===============================
 */

export class NotificationsService {

    /**
     * This function is responsible for notifying the user on mention on new comment
     * @param { _id, _content_mentions, _commented_by, _post } comment 
     */
    async newCommentMentions(comment: any) {
        try {
            await comment._content_mentions.forEach(async (user: any) => {
                const notification = await Notification.create({
                    _actor: comment._commented_by,
                    _owner: user,
                    _origin_comment: comment._id,
                    _origin_post: comment._post,
                    message: 'mentioned you on',
                    type: 'mention'
                });
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { _id, event._assigned_to, _posted_by } post 
     */
    async newEventAssignments(postId, assigned_to, groupId, posted_by) {
        try {

            // Let usersStream
            let userStream: any;

            // If all members are selected
            if (assigned_to.includes('all')) {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _groups: groupId
                }).select('first_name email'))
            } else {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(assigned_to);
            }

            await userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: posted_by,
                    _owner: user,
                    _origin_post: postId,
                    message: 'assigned you on',
                    type: 'assignment'
                });
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for notifying the user on mention on new post
     * @param { _id, _posted_by, _content_mentions } post 
     */
    async newPostMentions(postId, content_mentions, groupId, posted_by) {
        try {

            let userStream: any;

            if (content_mentions.includes('all')) {

                // Create Readble Stream from the Post Contents
                userStream = Readable.from(await User.find({
                    _groups: groupId
                }).distinct('_id'))

            } else {

                // User Stream from the post contents
                userStream = Readable.from(content_mentions)
            }

            userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: posted_by,
                    _owner: user,
                    _origin_post: postId,
                    message: 'mentioned you on',
                    type: 'mention'
                })
            })
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for notifying the user on mention on new Folio
     * @param { _id, _posted_by, _content_mentions } post 
     */
    async newFolioMentions(file: string, actor: string, owner: string) {
        try {

            let fileData: any = await File.findById(file).select('_group')
                /*
                .populate([
                    { path: '_group', select: 'group_name group_avatar workspace_name' },
                ])*/
                ;

            // Let usersStream
            let userStream: any;

            // If all members are selected
            if (owner.includes('all')) {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _groups: fileData._group
                }).select('first_name email'))
            } else {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _id: owner
                }).select('first_name email'));
            }

            await userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: actor,
                    _owner: user,
                    _origin_folio: file,
                    message: 'mentioned you on',
                    type: 'mention_folio'
                });
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new task to them
     * @param { postId, assigned_to, groupId, posted_by } post 
     */
    async newTaskAssignment(postId, assigned_to, groupId, posted_by) {

        try {
            // Let usersStream
            let userStream: any;

            // If all members are selected
            if (assigned_to.includes('all')) {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _groups: groupId
                }).select('first_name email'))
            } else {
                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(assigned_to);
            }

            await userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: posted_by,
                    _owner: user,
                    _origin_post: postId,
                    message: 'assigned you on',
                    type: 'assignment'
                });
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on re-assigning of a new task to them
     * @param { _id, _assigned_to, _posted_by } post
     */
    async newTaskReassignment(postId, assigneeId: string, posted_by, io: any) {

        try {
            const notification = await Notification.create({
                _actor: posted_by,
                _owner: assigneeId,
                _origin_post: postId,
                message: 'assigned you on',
                type: 'assignment'
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying the creator of the post when the task changed the status
     * @param { _id, _assigned_to, _posted_by } post
     * @param status
     */
    async taskStatusChanged(postId: String, status: string, actor: string, assigned_to, owner?: string, io?: any) {
        try {
            if (owner) {
                const notification = await Notification.create({
                    _actor: actor,
                    _owner: owner,
                    _origin_post: postId,
                    message: status,
                    type: status
                });
                await helperFunctions.sendNotificationsFeedFromService(owner, io);
            } else {

                // Create Readble Stream from the Event Assignee
                const userStream = Readable.from(assigned_to);

                await userStream.on('data', async (user: any) => {
                    const notification = await Notification.create({
                        _actor: actor,
                        _owner: user,
                        _origin_post: postId,
                        message: status,
                        type: status
                    });
                    await helperFunctions.sendNotificationsFeedFromService(user?._id, io);
                });
            }
        } catch (err) {
            throw err;
        }
    };

    /**
    * This function is responsible for notifying the user getting a new comment
    * @param { _id, _commented_by, _post, _posted_by } comment 
    */
    async newComment(comment: any, postId: any, owner: string) {
        try {
            const notification = await Notification.create({
                _actor: comment._commented_by,
                _owner: owner,
                _origin_comment: comment._id,
                _origin_post: postId,
                message: 'commented on',
                type: 'comment'
            });
        } catch (err) {
            throw err;
        }
    };

    /**
    * This function is responsible for notifying the user´s comment is liked
    * @param { _id, _commented_by, _post, _posted_by } comment 
    */
    async likeComment(comment: any, owner: string, actor: string) {
        try {
            const notification = await Notification.create({
                _actor: actor,
                _owner: owner,
                _origin_comment: comment._id,
                _origin_post: comment._post,
                message: 'liked your comment on',
                type: 'like_comment'
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on a new follower
     */
    async followPost(postId, posted_by, follower: string) {
        try {
            const notification = await Notification.create({
                _actor: follower,
                _owner: posted_by,
                _origin_post: postId,
                message: 'follows',
                type: 'follow'
            });
        } catch (err) {
            throw err;
        }
    };

    async likePost(postId, owner: string, actor: string) {
        try {
            const notification = await Notification.create({
                _actor: actor,
                _owner: owner,
                _origin_post: postId,
                message: 'likes',
                type: 'likes'
            });
        } catch (err) {
            throw err;
        }
    };


    /**
    * This function is responsible for notifying the user getting a new post in one of his/her groups
    * @param { postId, groupId, posted_by } comment 
    */
    async newPost(postId: any, groupId: any, posted_by: string, io: any) {
        try {
            console.log(postId);
            // Let usersStream
            let userStream = Readable.from(await User.find({
                _groups: groupId
            }).select('first_name email'))

            await userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: posted_by,
                    _owner: user,
                    _origin_post: postId,
                    _origin_group: groupId,
                    message: 'posted',
                    type: 'new-post'
                });

                await helperFunctions.sendNotificationsFeedFromService(user, io, true);
            });

        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for fetching the latest first 5 read notifications
     * @param userId 
     */
    async getRead(userId: string) {
        try {
            const notifications = await Notification.find({
                $and: [
                    { _owner: userId },
                    { read: true },
                    { type: { $ne: 'new-post' } }
                ]
            })
                .limit(5)
                .sort('-created_date')
                .populate('_actor', 'first_name last_name profile_pic')
                .populate({ path: '_origin_post', populate: { path: '_group' } })
                .populate('_origin_comment')
                .populate('_owner', 'first_name last_name profile_pic')
                .populate('_origin_group', 'group_name group_avatar')
                .populate('_origin_folio')
                .populate({ path: '_origin_folio', populate: { path: '_group' } })
                .lean();

            return notifications;
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for fetching the latest first 5 un-read notifications
     * @param userId 
     */
    async getUnread(userId: string) {
        try {
            const notifications = await Notification.find({
                $and: [
                    { _owner: userId },
                    { read: false },
                    { type: { $ne: 'new-post' } }
                ]
            })
                .sort('-created_date')
                .populate('_actor', 'first_name last_name profile_pic')
                .populate({ path: '_origin_post', populate: { path: '_group' } })
                .populate('_origin_comment')
                .populate('_owner', 'first_name last_name profile_pic')
                .populate('_origin_group', 'group_name group_avatar')
                .populate('_origin_folio')
                .populate({ path: '_origin_folio', populate: { path: '_group' } })
                .lean();

            return notifications;
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for fetching the latest new post notifications
     * @param userId 
     */
    async getNewPost(userId: string) {
        try {
            const notifications = await Notification.find({
                $and: [
                    { _owner: userId },
                    { read: false },
                    { type: 'new-post' }
                ]
            })
                .sort('-created_date')
                .populate('_actor', 'first_name last_name profile_pic')
                .populate({ path: '_origin_post', populate: { path: '_group' } })
                .populate('_origin_comment')
                .populate('_owner', 'first_name last_name profile_pic')
                .populate('_origin_folio')
                .populate({ path: '_origin_folio', populate: { path: '_group' } })
                .lean();

            return notifications;
        } catch (err) {
            throw err;
        }
    };

    /**
    * This function is responsible for notifying the user is added to a groups
    * @param { userId, groupId, posted_by } comment 
    */
    async joinGroup(userId: any, groupId: any, added_by: string, io: any) {
        try {
            const notification = await Notification.create({
                _actor: added_by,
                _owner: userId,
                _origin_group: groupId,
                message: 'added you to',
                type: 'join-group'
            });

            await helperFunctions.sendNotificationsFeedFromService(userId, io, true);

        } catch (err) {
            throw err;
        }
    };

    /**
    * This function is responsible for notifying the user is removed from a groups
    * @param { userId, groupId, posted_by } comment 
    */
    async leaveGroup(userId: any, groupId: any, removed_by: string, io: any) {
        try {
            const notification = await Notification.create({
                _actor: removed_by,
                _owner: userId,
                _origin_group: groupId,
                message: 'removed you from',
                type: 'leave-group'
            });

            await helperFunctions.sendNotificationsFeedFromService(userId, io, true);

        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { _id, event._assigned_to, _posted_by } post 
     */
    async launchApprovalFlow(item, assigned, posted_by, io) {
        try {
            await Notification.create({
                _actor: posted_by,
                _owner: assigned._id,
                _origin_item: item._id,
                message: 'launched the approval flow',
                type: 'launch-approval-flow'
            });

            await helperFunctions.sendNotificationsFeedFromService(assigned._id, io, true);

            // SEND EMAIL TO ALL USERS IN THE FLOW TO INFORM THEY NEED TO REVIEW THE ITEM
            // Obtain the workspace for the api key for the email
            const workspace: any = await Workspace.findById({
              _id: item._group._workspace
            }).select('management_private_api_key').lean();
      
            // send email to assigned users
            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/launch-approval-flow`, {
                API_KEY: workspace['management_private_api_key'],
                user: assigned,
                item: JSON.stringify(item)
            })
            .catch((err)=>{
                console.log(err)
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { _id, event._assigned_to, _posted_by } post 
     */
    async rejectItem(item, assigned, rejected_by, io) {
        try {
            await Notification.create({
                _actor: rejected_by,
                _owner: assigned._id,
                _origin_item: item._id,
                message: 'rejected the item',
                type: 'reject-item'
            });

            await helperFunctions.sendNotificationsFeedFromService(assigned._id, io, true);

            const workspace: any = await Workspace.findById({
                _id: item._group._workspace
              }).select('management_private_api_key').lean();

            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/reject-item`, {
                API_KEY: workspace['management_private_api_key'],
                user: assigned,
                item: JSON.stringify(item)
            })
            .catch((err)=>{
                console.log(err)
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { _id, event._assigned_to, _posted_by } post 
     */
    async itemApproved(item, assigned, io) {
        try {
            await Notification.create({
                _owner: assigned._id,
                _origin_item: item._id,
                message: 'the item has been approved by all assignees',
                type: 'approved-item'
            });

            await helperFunctions.sendNotificationsFeedFromService(assigned._id, io, true);

            // Obtain the workspace for the api key for the email
            const workspace: any = await Workspace.findById({
              _id: item._group._workspace
            }).select('management_private_api_key').lean();

            // send email user
            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/item-approved`, {
              API_KEY: workspace['management_private_api_key'],
              user: assigned,
              item: JSON.stringify(item)
            })
            .catch((err)=>{
                console.log(err)
            });
      
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for fetching the marking the notifications to read
     * @param topListId 
     */
    async markRead(topListId: string) {
        try {
            const markRead = await Notification.findOneAndUpdate({
                _id: topListId
            }, {
                $set: {
                    read: true
                }
            });

            return true;
        } catch (err) {
            throw err;
        }
    };

}
