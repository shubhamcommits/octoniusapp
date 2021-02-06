import express from 'express';
import { Auths, workspaceFileHandler } from '../../utils';
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

// POST - Logout from the server
routes.post('/auths/sign-out', authsHelper.signOut);

// -| Workspace General |-

// GET - Get workspace details
routes.get('/:workspaceId', workspaces.getWorkspace);

// PUT - Edit the workspace details
routes.put('/:workspaceId', workspaceFileHandler, workspaces.updateWorkspace);

// POST - Invite the user
routes.post('/invite', workspaces.inviteUser);

// Get all unique email domains that belong within the given workspace that match the query.
routes.get('/emailDomains/:workspaceId/:query', workspaces.getUniqueEmailDomains);

// Get all unique job positions that belong within the given workspace that match the query.
routes.get('/jobPositions/:workspaceId/:query', workspaces.getUniqueJobPositions);

// Get all unique skills that belong within the given workspace that match the query.
routes.get('/skills/:workspaceId/:query', workspaces.getUniqueSkills);

// DELETE - Removes the workspace from the database
routes.delete('/:workspaceId', workspaces.remove);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as workspaceRoutes }