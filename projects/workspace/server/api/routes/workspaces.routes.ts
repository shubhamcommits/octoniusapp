import express from 'express';
import { Auths } from '../../utils';
import { WorkspaceController } from '../controllers';

// Create Workspace controller Class
const workspaces = new WorkspaceController()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// POST - Creates a new workspace
routes.post('/', workspaces.createNewWorkspace);

// GET - Checks the availability of the workspace name
routes.get('/check-availability', workspaces.checkWorkspaceAvailability);

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// GET - Get all workspace domains
routes.get('/:workspaceId/domains', workspaces.getDomains);

// POST - Add new domain to workspace's allowed domains
routes.post('/:workspaceId/domains', workspaces.addDomain);

// DELETE - Removes the domain from the workspace allowed domains
routes.delete('/:workspaceId/domains/:domain', workspaces.removeDomain);


/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as workspaceRoutes }