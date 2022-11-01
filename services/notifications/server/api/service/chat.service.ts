import { User, ChatNotification, Chat, Message } from "../models";
import { Readable } from 'stream';
import { helperFunctions, firebaseNotifications } from '../../utils';
import moment from "moment";

/*  ===============================
 *  -- CHAT Service --
 *  ===============================
 */
export class ChatService {

    
    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { chatId, messageId, io } post 
     */
    async newChatMessage(userId: string, chatId: string, messageId: string, io) {
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

            // Create Readble Stream from the notification
            let userStream = Readable.from(await User.find({
                _id: { $in : usersArray}
            }).select('_id _workspace integrations.firebase_token'));
            const data  = await User.find({
                _id: { $in : usersArray}
            })


            await userStream.on('data', async (user: any) => {

                if (user && user._id != userId) {
                    await ChatNotification.create({
                        _actor: userId,
                        _owner: user._id || user,
                        _message: messageId,
                        _chat: chatId,
                        created_date: moment().format(),
                        text: 'sent you a message',
                        type: 'new-chat-message'
                    });

                    if (process.env.DOMAIN == 'app.octonius.com') {
                        if (user.integrations.firebase_token) {
                            // Send the notification to firebase for mobile notify
                            firebaseNotifications.sendFirebaseNotification(user?._workspace._id || user?._workspace, user?.integrations?.firebase_token, 'Octonius - New Message', message?._posted_by?.first_name + ' ' + message?._posted_by?.last_name + ' sent you a message');
                        }
                    }

                    // helperFunctions.sendNewMessage(message, io);
                    helperFunctions.sendNewMessageNotification(message, user._id || user, chatId, io);
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
            let notifications = await ChatNotification.find({
                $and: [
                    { _owner: userId },
                    { read: false }
                ]
            }).lean() || [];

            return notifications;
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for fetching the latest chat notifications
     * @param userId 
     */
    async markAsRead(userId: string, chatId: string, io: any) {
        try {
            const countReadMessages = await ChatNotification.find({
                    $and: [
                        { _owner: userId },
                        { _chat: chatId },
                        { read: false }
                    ]
                }).countDocuments();


            await ChatNotification.updateMany({
                    $and: [
                        { _owner: userId },
                        { _chat: chatId },
                        { read: false }
                    ]
                }, {
                    $set: {
                        read: true,
                        read_date: moment().format()
                    }
                });

            helperFunctions.sendMessagesReadNotification(userId, chatId, countReadMessages, io);
            return countReadMessages;
        } catch (err) {
            throw err;
        }
    };
}
