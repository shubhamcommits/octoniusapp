import express from 'express';
import { Auths } from '../../utils';
import { StoriesController } from '../controllers';

// Create story controller Class
const story = new StoriesController()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// -| Workspace stories |-

// GET - Get a story
routes.get('/one/:storyId', story.getStory);

// POST - Add new story to workspace
routes.post('/', story.addStory);

// GET - Get all stories in a story
routes.get('/all', story.getAllStories);

// POST - Edit a story
routes.put('/:storyId', story.editStory);

// DELETE - Removes the story from the workspace
routes.delete('/:storyId', story.remove);

// POST - confirm going to event
routes.put('/:storyId/confirmEvent', story.confirmEvent);

// POST - Confirm MAYBE going to event
routes.put('/:storyId/rejectEvent', story.rejectEvent);

// POST - Confirm NOT going to event
routes.put('/:storyId/doubtEvent', story.doubtEvent);

// POST - Like a story
routes.put('/:storyId/like', story.like);

// POST - Unlike a story
routes.put('/:storyId/unlike', story.unlike);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as storiesRoutes }