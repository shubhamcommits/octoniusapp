import { Notification, User, ChatNotification, Chat, Message } from "../models";
import { Readable } from 'stream';
import { helperFunctions, axios } from '../../utils';
import moment from "moment";

var admin = require("firebase-admin");
const serviceAccount = require("./octonius-mobile-firebase-adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // credential: cert({
    //     projectId: 'octonius-mobile',
    //     clientEmail: "firebase-adminsdk-h61te@octonius-mobile.iam.gserviceaccount.com",
    //     privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBZybr5UQReHtG\n94Rg8b0nq4LJWUegTqdnBcBph3OoDEnEE6BgXFySdxKuXlj5202sMqpUqTa84Lzy\nYfso/3K/Uu9qdFQN6kec3L0ZC7VbltVeNKYFU+3qP91l0D6dg5W78Djh3sEOMfI0\no7f/wQxFFW3vYECvuNIpa4a+jOSwvLxqstoW6pWOrku935+5TciijOefOjrnEAgR\ng9wC+Y+bLjfZXVYL01EElY1q/HJYMK7gnFcZDhbxjBNINA40zrNnss0H8v1WyJ3M\nhIi9lab3BUycQWHfkP31CoZjOHNYQ/DsIH6acCAxqCVxBCkHPgpWY35vTcfQVRhG\nohkYQ3kDAgMBAAECggEADFiA2AsdEr5tpCSVuziDOh6NLTw5QcbzkbSAyVu/qskK\nBm24TZ5nvGPEegQEywJQTX84d0oL9/eiqBhQF5hi40qwhMujN/YuFxnSKmCgdZXF\nzgsvU+S9Kbhk8iRecuCc9M/LWcPF8BmJHAoda0KP/XL2PxMWXgE+zS0Tf2NwD8YH\n/7/FBzisEf6sXnYOD8q6cSG9mzBl5fOFw9V8sP68UzXD6Pwhkx3O7aM4HHod8zhd\nX1kDqS9o5zV2Mzuku1DilMEmorQa20yuWahxv5ewPlvRhiiY0SQeHokwjjucEk3J\nJZ4ohJTLgvSQV3yHe5LgdVf2pdBvHJSDI3KOEguWVQKBgQDydmNZoUhsFt/4PDmn\nV8ikg7etMnDdlrf5wEolawuElObmLqzZ4kyLlSSrhgkr9nhtHE8kJSQOWwL3iUps\nDIQ0Oh6qWjVk+viHsdGk6gmiX2kPdJ4a5eQtbHrc6uvbLwcm5obiqf8PCn/vToVP\n9QnR5EqRjSKOvglCI8nQ470/hwKBgQDMM4lvNCUYwIydDUt+zN11ZJyzvnK1zs2/\nPAG4ZlZrGbt8dK8qbJH/U7YrAfjovHMKzXzGoR20l/tcYk6StWzNOIxukQ6cV47A\n/rc1szXeWAb3XanjN2wt19FJIGqPanJ1Tm5t6FhW5bzE9KOwGKNIjncKVK+mDhD8\nedGMvCYBpQKBgQDSnqjbGVFyI8TXPGnQxl7TGmCaIXEN7HlQiQtfycctmrOhTPZ2\nJzDbJ+m83ihleitOjQLqoSDbH5BKO4bcqVrGi55L2ST83U67gWpd2bgYxsza0jDt\nqLo4Az4PXjsYIZgS4LpXd9jK1hIgbZM8y92F6Mwl9/YHDWm5fKE5xjuFTQKBgQCu\ns2Tga+dU/t8OOmKdkB3jonliWgx/uPdTpb3/CibjKDe76YQ3Mn3RyMewkdZnH1r5\nIgafVRY5/FEDn+ODJo54IOocaiPq5Anw2brayYDLwdnr5glDqJX3vo2CF6azHing\nbIKTq1Vwuso+YuJr9Rg1KhV0FDHWSnCD4KDD2/BUNQKBgAx3Ug8F8rkcRjbB4tjx\n0Atzt9HFIHG32V5NMG/HY8uQc7tE8gtVpWt2YonTzqXlXguQ1wuxRvGxW8WHG6GX\nTo1IA4LFlJ8NmbRt+lnuNFo2dq7M5ClQ7DPDvhoHYG/p1QRUbMFlVHDLThPq3IpH\njqplpBP9mSAIFIAK6KPuMf4y\n-----END PRIVATE KEY-----\n"
    // }),
    //credential: applicationDefault(),
    //credential: admin.credential.applicationDefault(),
    //credential: admin.credential.cert(serviceAccount),
    //credential: admin.credential.cert("./octonius-mobile-firebase-adminsdk.json"),
    //databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

/*  ===============================
 *  -- CHAT Service --
 *  ===============================
 */
export class ChatService {

    
    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { chatId, messageId, io } post 
     */
    async newChatMessage(chatId: string, messageId: string, io) {
        try {

            const message = await Message.findById({ _id: messageId })
                .populate({ path: '_posted_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            message._chat = await Chat.findById({ _id: chatId })
                .select('archived members _group')
                .populate({ path: 'members._user', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name _members _admins _workspace' })
                .lean();

            let usersArray = [];
            if (message._chat && message._chat.members) {
                usersArray = message._chat.members.map(m => { return m._user; });
            }

            if ( message?._chat?._group) {
                usersArray = [...(message._chat._group._members || []), ...(message._chat._group._admins || [])]
            }

            console.log('message chat group or members', message._chat, usersArray);

            // Create Readble Stream from the notification
            let userStream = Readable.from(await User.find({
                _id: { $in : usersArray}
            }).select('_id integrations.firebase_token'));
            const data  = await User.find({
                _id: { $in : usersArray}
            })


            await userStream.on('data', async (user: any) => {

                if ((user._id || user) != (message?._posted_by?._id || message?._posted_by)){
                    const notification = await ChatNotification.create({
                        _actor: message?._posted_by?._id || message?._posted_by,
                        _owner: user._id || user,
                        _message: messageId,
                        created_date: moment().format(),
                        message: 'sent you a message',
                        type: 'new-chat-message'
                    });

                    if (process.env.DOMAIN == 'app.octonius.com') {
                        if (user.integrations.firebase_token) {
                            // Send the notification to firebase for mobile notify
                            this.sendFirebaseNotification(message._chat?._group?._workspace._id || message._chat?._group?._workspace, user?.integrations?.firebase_token, 'Octonius - New Message', message?._posted_by?.first_name + ' ' + message?._posted_by?.last_name + ' sent you a message');
                        }
                    }

                    await helperFunctions.sendNewMessageNotificationFromService(message, io);
                }
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for fetching the latest chat notifications
     * @param userId 
     */
    async getUnreadChats(userId: string) {
        try {
            let notifications = [];
            notifications = await ChatNotification.find({
                $and: [
                    { _owner: userId },
                    { read: false }
                ]
            })
            .select('_actor _owner _message created_date message type read read_date')
            .populate({ path: '_message._chat', select: '_id' })
            .lean();

            return notifications;
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for fetching the latest chat notifications
     * @param userId 
     */
    async markAsRead(userId: string, chatId: string) {
        try {
            let messagesStream = Readable.from(await Message.find({ _chat: chatId }).select('_id'));

            await messagesStream.on('data', async (message: any) => {
                await ChatNotification.updateMany({
                        $and: [
                            { _owner: userId },
                            { read: false },
                            { _message: message._id }
                        ]
                    }, {
                        read: true,
                        read_date: moment().format()
                    })
                    .lean();
            });

            return true;
        } catch (err) {
            throw err;
        }
    };

     async sendFirebaseNotification(workspaceId: string, registrationToken: string, messageTitle: string, messageBody: string) {

        if (registrationToken && messageTitle && messageBody) {         

            var payload = {
                notification: {
                    title: messageTitle,
                    body: messageBody,
                    data: {
                        workspaceId: workspaceId
                    }
                }
                //, topic: 'octonius'
            };

            var options = {
                priority: "high",
                timeToLive: 60 * 60 *24
            };

            admin.messaging().sendToDevice(registrationToken, payload, options)
                .then((response) => {
                    console.log("Successfully sent message:", response);
                })
                .catch((error) => {
                    console.log("Error sending message:", error);
                });
        }
    };
}
