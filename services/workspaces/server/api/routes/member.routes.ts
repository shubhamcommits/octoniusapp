import express from 'express';
import { Auths } from '../../utils';
import { MemberControllers } from '../controllers';

// Create member controller Class
const members = new MemberControllers()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// -| Workspace Members |-

// GET - Get a list of first 10 workspace members
routes.get('/', members.getWorkspaceMembers);

// GET - Get a list of next 5 workspace members based on the lastUserId fetched from the first 10 workspace
routes.get('/next', members.getNextWorkspaceMembers);

// GET - Get a list of first 10 workspace members who are not present in a group
routes.get('/groups', members.membersNotInGroup);

// POST - Delete a user from workspace
routes.post('/delete', members.removeUserFromWorkplace);

routes.post('/activate', members.reactivateUserInWorkplace);

// GET - Get a list of workspace users
routes.get('/users', members.getWorkspaceUsers);

// GET - Get a list of first workspace members with their social stats
routes.get('/social-stats', members.getWorkspaceMembersSocialStats);


/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as memberRoutes }