import { User } from "../models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";
import { ChatService } from "../service";
import { sendErr } from "../../utils/sendError";
import { helperFunctions } from '../../utils';
import axios from 'axios';

// Creating Service class in order to build wrapper class
const chatService = new ChatService();

/*  ===============================
 *  -- NOTIFICATIONS CONTROLLERS --
 *  ===============================
 */

export class ChatNotificationsController {


    /**
     * This function is responsible for notifying the users when an item was approved by every member in the flow
     * @param { userId, groupId, posted_by, io } post 
     */
    async newChatMessage(req: Request, res: Response, next: NextFunction) {

        let { chatId, messageId, io } = req.body;

        try {
            await chatService.newChatMessage(chatId, messageId, io);

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
     * This function is responsible for returning the users unread notifications
     */
    async unreadChats(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        try {
            if (!userId) {
                return sendErr(res, new Error('Please provide a userId!'), 'Please provide a userId!', 500);
            }

            const unreadChats = await chatService.getUnreadChats(userId);

            // Send status 200 response
            return res.status(200).json({
                message: `Unread Chats!`,
                unreadChats: unreadChats
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction) {
        const userId = req['userId'];
        const { params: { chatId } } = req;

        try {
            if (!userId || !chatId) {
                return sendErr(res, new Error('Please provide a userId and a chatId!'), 'Please provide a userId and a chatId!', 500);
            }

            const read = await chatService.markAsRead(userId, chatId);

            // Send status 200 response
            return res.status(200).json({
                message: `Chat Marked as Read!`,
                read: read
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}
