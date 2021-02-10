import { NotificationsService } from "../api/service"
import { Post, Comment, User } from "../api/models";
import { Readable } from 'stream';
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
 * This function is responsible for generating the notifications feed
 * @param userId 
 * @param io 
 */
async function generateFeed(userId: string, io: any) {
    try {
        const unreadNotifications = await notifications.getUnread(userId);
        const readNotifications = await notifications.getRead(userId);

        const feed = { unreadNotifications, readNotifications };

        // console.log(feed)

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
    console.log('Notifications Sent!')
}

/**
 * This function sends the generated notifications feed to the user
 * @param socket 
 * @param userId 
 * @param io 
 */
async function sendNotificationsFeedFromService(userId: string, io: any) {
    //  here the same as before, I deleted the emit code
    generateFeed(userId, io);
    console.log('Notifications Sent!')
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
                console.log(user)
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


/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {

    // HAS PROPERTY
    hasProperty,

    // GENERATE FEED
    generateFeed,

    // SEND NOTIFICATIONS FEED
    sendNotificationsFeed,
    sendNotificationsFeedFromService,

    // NOTIFY RELATED USERS
    notifyRelatedUsers,

    // Validate ObjectId
    validateId
}