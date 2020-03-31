import { NotificationsService } from "../api/service"
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
};

/**
 * This function is used to validate an ObjectId
 * @param id
 */

function validateId(id: any){
    var stringId: String = id.toString();
    if (!ObjectId.isValid(stringId)){
        return false;
    }
    var result = new ObjectId(stringId);
    if (result.toString() != stringId){
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

    // Validate ObjectId
    validateId
}