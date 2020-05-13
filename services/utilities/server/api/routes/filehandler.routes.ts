import express from 'express';
import { groupFileHandler, postFileHandler, userFileHandler, workspaceFileHandler } from '../../utils/filehandlers';

const routes = express.Router();

// GET - Handles the file attachment(group_avatar, group files) for the groups
routes.get('/groups/:file', groupFileHandler);

// GET - Handles the file attachments for the posts
routes.get('/posts/:file', postFileHandler);

// GET - Handles the file attachment(profileImage) for the user
routes.get('/users/:file', userFileHandler);

// GET - Handles the file attachment(workspace_avatar) for the workspace
routes.get('/workspaces/:file', workspaceFileHandler);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as fileHandlerRoutes }