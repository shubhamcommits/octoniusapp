import express from 'express';
import { ChatsController } from '../controllers';
import { Auths } from '../utils';

const routes = express.Router();

/**
 * Chat Controller Class Object
 */
const chatController = new ChatsController();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// This route is used to create a chat
routes.post('/', chatController.create);

// PUT - This route archive or unarchive a chat
routes.put('/archive-chat', chatController.archiveChat);

// GET - This function fetches the group chats
routes.get('/group-chats', chatController.getGroupChats)

// GET - This function fetches the group chats
routes.get('/direct-chats', chatController.getDirectChats)

// GET - This route is used to retrieve a chat
routes.get('/:chatId', chatController.get);

// PUT - This route is used to like a post
routes.put('/:chatId/add-member', chatController.addMember);

// PUT - This route is used to unlike a post
routes.put('/:chatId/remove-member', chatController.removeMember);

//GET - This route fetches the list of messages from a chat
routes.get('/:chatId/mesages', chatController.getMessages);

// PUT - This route is used to like a post
routes.put('/send-message', chatController.sendMessage);

export { routes as chatRoutes };