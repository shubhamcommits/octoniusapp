import { NotificationsService } from "../api/service"
import { User } from "../api/models";
import { Readable } from 'stream';
import { DateTime } from 'luxon';

const ObjectId = require('mongoose').Types.ObjectId;

// Create Notifications controller class
const notifications = new NotificationsService()

/**
 * This function is resposible for checking if an object has certain property or not
 * @param object 
 * @param property 
 */
function hasProperty(object: any, property: any) {
    return Object.prototype.hasOwnProperty.call(object, property);
}

/**
 * This function is resposible for removing the duplicated objects in an array
 * @param array 
 * @param property 
 */
function removeDuplicates(array: Array<any>, property: string) {
    return array.filter((obj, pos, arr) => {
        return arr.map(mapObj => (mapObj[property] || mapObj)).indexOf((obj[property] || obj)) === pos;
    });
}

/**
 * This function is responsible for generating the notifications feed
 * @param userId 
 * @param io 
 */
async function generateFeed(userId: string, io: any,backend?:any) {

    try {
        const unreadNotifications = await notifications.getUnread(userId);
        const readNotifications = await notifications.getRead(userId);
        const unreadPosts = await notifications.getNewPost(userId);
        const pendingApprovals =  await sortPendingApprovals(await notifications.getPendingApprovals(userId));

        const feed = { unreadNotifications, readNotifications, unreadPosts, pendingApprovals, new:backend};
        // I moved this line from outside this function to inside
        io.sockets.in(userId).emit('notificationsFeed', feed);
    } catch (err) {
        console.log('err', err);
    }
};

/**
 * This function sends the generated notifications feed to the user
 * @param socket 
 * @param userId 
 * @param io 
 */
async function sendNotificationsFeed(socket: any, userId: string, io: any) {
    //  here the same as before, I deleted the emit code
    generateFeed(userId, io);
}

/**
 * This function sends the generated notifications feed to the user
 * @param socket 
 * @param userId 
 * @param io 
 */
async function sendNotificationsFeedFromService(userId: string, io: any, backend?:any) {
    //  here the same as before, I deleted the emit code
    generateFeed(userId, io, backend);
}

/**
 * This function sends the generated notifications feed to the user
 * @param socket 
 * @param userId 
 * @param io 
 */
function sendNewMessageNotification(message: any, userId: string, chatId: string, io: any) {
    io.sockets.to('user_' + userId).emit('newChatNotification', {message, userId, chatId});
}

/**
 * This function is responsible for notifying the users
 * @param io 
 * @param socket 
 * @param data 
 */
async function notifyRelatedUsers(io: any, socket: any, data: any) {
    try {

        let post: any = data, comment: any;
        // we had a problem that the flow got interrupted because of the db search
        //  by adding type property (at the moment post or comment) to data  we can specify which database to search through

        // If there are mentions on post content...
        if (post._content_mentions.length !== 0) {
            // ...emit notificationsFeed for every user mentioned
            //  generateFeed seems to always be followed by emitting it to the specified user, so I placed the socket.emit function inside the generateFeed function
            //  this way I wouldn't put an await inside a for function
            //  proposal: we might want to change name generateFeed to generateFeedAndEmitToUser

            let userStream: any;

            if (post._content_mentions.includes('all')) {

                // Create Readble Stream from the Post Contents
                userStream = Readable.from(await User.find({
                    _groups: post._group
                }).distinct('_id'))

            }   else {

                // User Stream from the post contents
                userStream = Readable.from(post._content_mentions)
            }

            userStream.on('data', (user: any) => {
                generateFeed(user, io);
            })

            // for (const userId of post._content_mentions) {
            //     generateFeed(userId, io);
            // }
        }

        // If there are followers on post content...
        if (post._followers && post._followers.length !== 0) {
            // ...emit notificationsFeed for every follower
            for (const userId of post._followers) {
                generateFeed(userId, io);
            }
        }

        let userStream: any;

        if (post._assigned_to.includes('all')) {
            // Create Readble Stream from the Assignee
            userStream = Readable.from(await User.find({
                _groups: post._group
            }).select('id'));
        } else {
            // Create Readble Stream from the Assignee
            userStream = Readable.from(post._assigned_to);
        }

        await userStream.on('data', async (user: any) => {
            generateFeed(user._id, io);
        });

        //  if we mentioned someone in a comment we trigger this part
        //  same process, we generate the feed and emit it to the mentioned user, tiggering a notification in real-time
    } catch (err) {
        console.log('err', err);
    }
};


/**
 * This function is used to validate an ObjectId
 * @param id
 */

function validateId(id: any) {
    var stringId: String = id.toString();
    if (!ObjectId.isValid(stringId)) {
        return false;
    }
    var result = new ObjectId(stringId);
    if (result.toString() != stringId) {
        return false;
    }
    return true;
}

function sortPendingApprovals(notifications: any) {
    return notifications.sort((n1, n2) => {
        let n1Date = (n1._origin_post) ? n1._origin_post.approval_due_date : (n1._origin_folio) ? n1._origin_folio.approval_due_date : n1.created_date;
        let n2Date = (n2._origin_post) ? n2._origin_post.approval_due_date : (n2._origin_folio) ? n2._origin_folio.approval_due_date : n2.created_date;
        return (n1Date && n2Date)
            ? (isBefore(n1Date, n2Date)) ? -1 : 1
            : (n1Date && !n2Date) ? -1 : 1;
      });
}

function isBefore(day1: any, day2: any) {
    if (!!day1 && !!day2) {
        if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.startOf('day').toMillis() < day2.startOf('day').toMillis();
        } else {
        return DateTime.fromISO(day1).startOf('day').toMillis() < DateTime.fromISO(day2).startOf('day').toMillis();
        }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
        return false;
    }
}


/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {

    hasProperty,
    removeDuplicates,
    generateFeed,
    sendNotificationsFeed,
    sendNotificationsFeedFromService,
    sendNewMessageNotification,
    // sendNewMessage,
    notifyRelatedUsers,
    validateId
}