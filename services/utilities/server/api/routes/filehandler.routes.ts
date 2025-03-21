import express from 'express';
import { Auths } from '../../utils/auths';
import { flamingoFileHandler, groupFileHandler, postFileHandler, userFileHandler, workspaceFileHandler, groupsFilesHandler, utilitiesFileHandler } from '../../utils/filehandlers';

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// GET - Handles the file attachment(group_avatar, group files) for the groups
routes.get('/groups/:workspaceId/:file', groupFileHandler);

// GET - Handles the file attachments for the posts
routes.get('/posts/:workspaceId/:file', postFileHandler);

// GET - Handles the file attachment(profileImage) for the user
routes.get('/users/:workspaceId/:file', userFileHandler);

// GET - Handles the file attachment(workspace_avatar) for the workspace
routes.get('/workspaces/:workspaceId/:file', workspaceFileHandler);

// GET - Handles the file added in the flamingo forms
routes.get('/flamingo/:workspaceId/:file', flamingoFileHandler);

// GET - Handles the utilities files 
routes.get('/files/:workspaceId/:file', utilitiesFileHandler);

// GET - Download the last version of a file
routes.get('/groupsFiles/:workspaceId/:fileId', groupsFilesHandler);


/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as fileHandlerRoutes }