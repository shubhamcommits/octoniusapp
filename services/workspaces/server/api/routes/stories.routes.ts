import express from 'express';
import { Auths } from '../../utils';
import { StoriesController } from '../controllers';

// Create lounge controller Class
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

// POST - Add new lounge to workspace
routes.post('/', story.addStory);

// GET - Get all stories in a story
routes.get('/all', story.getAllStories);

// POST - Edit a story
routes.put('/:storyId', story.editStory);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as storiesRoutes }