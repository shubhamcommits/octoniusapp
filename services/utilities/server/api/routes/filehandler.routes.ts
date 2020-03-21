import express from 'express';
import { groupFileHandler, postFileHandler, userFileHandler, workspaceFileHandler } from '../../utils/filehandlers';

const routes = express.Router();

// POST - Handles the file attachment(group_avatar) for the groups
routes.post('/groups', groupFileHandler);

// POST - Handles the file attachments for the posts
routes.post('/posts', postFileHandler);

// POST - Handles the file attachment(profileImage) for the user
routes.post('/users', userFileHandler);

// POST - Handles the file attachment(workspace_avatar) for the workspace
routes.post('/workspaces', workspaceFileHandler);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as fileRoutes }