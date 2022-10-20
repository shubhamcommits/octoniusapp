import { Response, Request, NextFunction } from "express";
import { ChatService } from '../services';
import { sendErr } from '../utils/sendError';

const ObjectId = require('mongoose').Types.ObjectId;

const chatService = new ChatService();

export class ChatsController {

    /**
     * This function is responsible to create a chat
     * @param { chat } req
     */
    async create(req: Request, res: Response, next: NextFunction) {

        // Chat Object From request
        const { chat } = req.body;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call servide function for adding the chat
        const serviceResponse = await chatService.createChat(chat, userId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            });
        // Send Status 200 response
        return res.status(200).json({
            message: 'Chat Created Successfully!',
            chat: serviceResponse['chat'],
            newChat: serviceResponse['newChat']
        });
    }

    /**
     * This function is used to retrieve a chat
     * @param req 
     * @param res 
     * @param next 
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {

            let { chatId } = req.params;

            // Call service function to get
            const chat = await chatService.get(chatId);

            return res.status(200).json({
                message: 'Chat Found!',
                chat: chat
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error', 500);
        }
    }

    /**
     * This function is responsible for removing a chat
     * @param req 
     * @param res 
     * @param next 
     */
    async archiveChat(req: Request, res: Response, next: NextFunction) {
        try {

            // Retrieving data from request 
            const { chatId } = req.params;

            // Calling service function to remove chat
            const chat = await chatService.archiveChat(chatId);

            // Returning status 200 response
            return res.status(200).json({
                message: 'Chat archived successfully',
                chat: chat
            });

        } catch (error) {
            if (error == null) {
                return sendErr(res, null, 'User not allowed to remove this chat!', 403)
            }
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    async getDirectChats(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch data from request
            const userId = req['userId'];

            // Call service function to get recent groups
            const directChats = await chatService.getDirectChats(userId);

            // Send status 200 response
            return res.status(200).json({
                message: `Successfully Retrieved Direct Chats`,
                chats: directChats
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    async getGroupChats(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch data from request
            const userId = req['userId'];

            // Call service function to get recent groups
            const groupChats = await chatService.getGroupChats(userId);

            // Send status 200 response
            return res.status(200).json({
                message: `Successfully Retrieved Group Chats`,
                chats: groupChats
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for changing the task assignee
     * @param req 
     * @param res 
     * @param next 
     */
    async addMember(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { chatId }, body: { memberId } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        let chat = await chatService.addMember(chatId, memberId, userId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Task assignee updated!',
            chat: chat
        });
    }

    /**
     * This function is responsible for removing an assignee from the chat
     * @param req 
     * @param res 
     * @param next 
     */
    async removeMember(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { chatId }, body: { memberId } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call Service function to remove the assignee
        const chat = await chatService.removeMember(chatId, memberId, userId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Task assignee updated!',
            chat: chat
        });
    }

    async sendMessage(req: Request, res: Response, next: NextFunction) {

        const { body: { newMessage } } = req;
        // const userId = req['userId'];

        await chatService.sendMessage(newMessage)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Message Sent!'
        });
    }

    /**
     * This function fetches the 5 recent messages present inside a group
     * @param { query: { chatId, lastMessageId } } req 
     * @param res 
     * @param next 
     */
    async getMessages(req: Request, res: Response, next: NextFunction) {

        // Fetch chatId and lastMessageId from request
        const { params: { chatId }, query: { limit } } = req;
        const userId = req['userId'];

        // If groupId is not present, then return error
        if (!chatId) {
            return sendErr(res, new Error('Please provide the chatId as the query parameter'), 'Please provide the chatId as the query paramater!', 400);
        }

        let limitOfMessages = +limit || 10;

        // Fetch the next 5 recent messages
        await chatService.getMessages(chatId, userId, limitOfMessages)
            .then((messages) => {
                return res.status(200).json({
                    message: `The first ${messages.length} most recent messages!`,
                    messages: messages
                });
            })
            .catch((err) => {

                // If there's an error send bad request
                return sendErr(res, new Error(err), 'Unable to fetch the messages, kindly check the stack trace for error', 400)
            });
    }

    /**
     * This function fetches the 5 recent messages present inside a group
     * @param { query: { chatId, lastMessageId } } req 
     * @param res 
     * @param next 
     */
    async getNextMessages(req: Request, res: Response, next: NextFunction) {

        // Fetch chatId and lastMessageId from request
        const { params: { chatId }, query: { lastMessageId, lastMessagesPostedOn, limit } } = req;
        const userId = req['userId'];

        // If groupId is not present, then return error
        if (!chatId) {
            return sendErr(res, new Error('Please provide the chatId as the query parameter'), 'Please provide the chatId as the query paramater!', 400);
        }

        let limitOfMessages = +limit || 10;

        // Fetch the next 5 recent messages
        await chatService.getMessages(chatId, userId, limitOfMessages, lastMessageId, lastMessagesPostedOn)
            .then((messages) => {

                // If lastMessageId is there then, send status 200 response
                return res.status(200).json({
                    message: `The next ${messages.length} most recent messages!`,
                    messages: messages
                });
            })
            .catch((err) => {

                // If there's an error send bad request
                return sendErr(res, new Error(err), 'Unable to fetch the messages, kindly check the stack trace for error', 400)
            });
    }
}