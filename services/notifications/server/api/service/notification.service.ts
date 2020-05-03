import { Notification, User } from "../models";
import { Readable } from 'stream';

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
                    message: 'mentioned you in a comment.',
                    type: 'mention'
                });
            });
        } catch (err) {
            // ab yaha se error catch ho jaega
            return err
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { _id, event._assigned_to, _posted_by } post 
     */
    async newEventAssignments(post: any) {
        try {

            // Let usersStream
            let userStream: any;

            // If all members are selected
            if (post.event._assigned_to.includes('all')) {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _groups: post._group
                }).select('first_name email'))
            } else {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(post.event._assigned_to);
            }

            await userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: post._posted_by,
                    _owner: user,
                    _origin_post: post._id,
                    message: 'assigned an event to you.',
                    type: 'assignment'
                });
            });
        } catch (err) {
            return err;
        }
    };

    /**
     * This function is responsible for notifying the user on mention on new post
     * @param { _id, _posted_by, _content_mentions } post 
     */
    async newPostMentions(post: any) {
        try {
            await post._content_mentions.forEach(async (user: any) => {
                const notification = await Notification.create({
                    _actor: post._posted_by,
                    _owner: user,
                    _origin_post: post._id,
                    message: 'mentioned you in a post.',
                    type: 'mention'
                });
            });
        } catch (err) {
            return err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new task to them
     * @param { _id, task._assigned_to, _posted_by } post 
     */
    async newTaskAssignment(post: any) {
        try {
            const notification = await Notification.create({
                _actor: post._posted_by,
                _owner: post.task._assigned_to,
                _origin_post: post._id,
                message: 'assigned a task to you.',
                type: 'assignment'
            });
        } catch (err) {
            return err;
        }
    };

    /**
     * This function is responsible to notifying all the user on re-assigning of a new task to them
     * @param { _id, task._assigned_to, _posted_by } post
     */
    async newTaskReassignment(post: any) {

        console.log(JSON.parse(post))

        try {
            const notification = await Notification.create({
                _actor: post._posted_by,
                _owner: post.task._assigned_to,
                _origin_post: post._id,
                message: 'reassigned a task to you.',
                type: 'assignment'
            });
        } catch (err) {
            return err;
        }
    };

    /**
     * This function is responsible for fetching the latest first 5 read notifications
     * @param userId 
     */
    async getRead(userId: string) {
        try {
            const notifications = await Notification.find({
                _owner: userId,
                read: true
            })
                .limit(5)
                .sort('-created_date')
                .populate('_actor', 'first_name last_name profile_pic')
                .populate('_origin_post', '_group')
                .populate('_origin_comment', '_post')
                .populate('_owner', 'first_name last_name profile_pic')
                .lean();

            return notifications;
        } catch (err) {
            return err;
        }
    };

    /**
     * This function is responsible for fetching the latest first 5 un-read notifications
     * @param userId 
     */
    async getUnread(userId: string) {
        try {
            const notifications = await Notification.find({
                _owner: userId,
                read: false
            })
                .sort('-created_date')
                .populate('_actor', 'first_name last_name profile_pic')
                .populate('_origin_post', '_group')
                .populate('_origin_comment', '_post')
                .populate('_owner', 'first_name last_name profile_pic')
                .lean();

            return notifications;
        } catch (err) {
            return err;
        }
    };

    /**
     * This function is responsible for fetching the marking the notifications to read
     * @param topListId 
     */
    async markRead(topListId: string) {
        try {
            const markRead = await Notification.updateMany({
                $and: [
                    { read: false },
                    { _id: { $lte: topListId } }
                ]
            }, {
                $set: {
                    read: true
                }
            });

            return true;
        } catch (err) {
            return err;
        }
    };
}
