import express from 'express';
import { Auths } from '../../utils/auths';
import { FoldersControllers } from '../controllers/folders.controllers';

// Files Class Object
let folders = new FoldersControllers()

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// POST - Handles the adding folders inside a group
routes.post('/groups', folders.add);

// GET - Fetches the folders list
routes.get('/groups', folders.get);

// GET - Get details of a folder on the basis of fileId
routes.get('/:folderId', folders.getOne);

// PUT - Edit details of a folder on the basis of fileId
routes.put('/:folderId', folders.edit);

// DELETE - Delete the folder on the basis of fileId
routes.delete('/:folderId', folders.delete);

// PUT - Handles the move of a folder to another folder
routes.put('/:folderId/move-to-folder', folders.moveToFolder);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as foldersRoutes }