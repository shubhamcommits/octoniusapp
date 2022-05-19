import express from 'express';
import { Auths } from '../../utils/auths';
import { flamingoFileHandler, groupFileHandler, postFileHandler, userFileHandler, workspaceFileHandler, groupsFilesHandler } from '../../utils/filehandlers';

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// GET - Handles the file attachment(group_avatar, group files) for the groups
routes.get('/groups/:file', groupFileHandler);

// GET - Handles the file attachments for the posts
routes.get('/posts/:file', postFileHandler);

// GET - Handles the file attachment(profileImage) for the user
routes.get('/users/:file', userFileHandler);

// GET - Handles the file attachment(workspace_avatar) for the workspace
routes.get('/workspaces/:file', workspaceFileHandler);

// GET - Handles the file added in the flamingo forms
routes.get('/flamingo/:file', flamingoFileHandler);

routes.get('/groupsFiles/:fileId', groupsFilesHandler);


/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as fileHandlerRoutes }