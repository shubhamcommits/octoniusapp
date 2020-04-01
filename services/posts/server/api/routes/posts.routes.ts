import express from 'express';
import { PostController } from '../controllers';

const routes = express.Router();
const postController = new PostController();

// This route is used to add a post
routes.post('/new', postController.add);

// This route is used to edit a post
routes.post('/edit', postController.edit);

// This route is used to retrieve a post
routes.get('/get', postController.get);

// This route is used to remove a post
routes.post('/remove', postController.remove);


export { routes as postRoutes };