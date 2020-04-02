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

// This route is used to like a post
routes.post('/like', postController.like);

// This route is used to unlike a post
routes.post('/unlike', postController.unlike);

// This route is used to get this month's tasks
routes.get('/month-tasks', postController.getThisMonthTasks);

// This route is used to get this week's tasks
routes.get('/week-tasks', postController.getThisMonthTasks);

// This route is used to get next 5 tasks for this week
routes.get('/next-tasks', postController.getNextTasks);

// This route is used to get this month's events
routes.get('/month-events', postController.getThisMonthEvents);

// This route is used to get this week's events
routes.get('/week-events', postController.getThisMonthEvents);

// This route is used to get next 5 events for this week
routes.get('/next-events', postController.getNextEvents);


export { routes as postRoutes };