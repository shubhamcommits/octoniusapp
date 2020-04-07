import express from 'express';
import { PostController } from '../controllers';
import { Auths, postFileHandler } from '../utils';

const routes = express.Router();
const postController = new PostController();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// This route is used to add a post
routes.post('/', postFileHandler, postController.add);

/**
 * GET - This route fetches the list of posts present in a group
 * @param { groupId, lastPostId } query
 * @param lastPostId - optional
 */
routes.get('/', postController.getPosts);

// This route is used to edit a post
routes.put('/:postId', postController.edit);

// This route is used to retrieve a post
routes.get('/:postId', postController.get);

// This route is used to remove a post
routes.delete('/:postId', postController.remove);


export { routes as postRoutes };