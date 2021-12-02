import express from 'express';
import { Auths } from '../../utils';
import { loungeImageFileHandler } from '../../utils/filehandler';
import { LoungeController } from '../controllers';

// Create lounge controller Class
const lounge = new LoungeController()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// -| Workspace Lounges |-

// GET - Get a lounge
routes.get('/one/:loungeId', lounge.getLounge);

// GET - Get all workspace lounges
routes.get('/all', lounge.getAllLounges);

// GET - Get all workspace lounges
routes.get('/allCategories', lounge.getAllCategories);

// GET - Get all stories in a lounge or workspace
routes.get('/allStories', lounge.getAllStories);

// POST - Add new lounge to workspace
routes.post('/', lounge.addLounge);

// POST - Edit a lounge
routes.put('/:loungeId', lounge.editLounge);

// POST - Edit image
routes.put('/:workspaceId/updateImage/:elementId', loungeImageFileHandler, lounge.editImage);

// DELETE - Removes the lounge from the workspace
routes.delete('/:loungeId', lounge.removeLounge);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as loungesRoutes }