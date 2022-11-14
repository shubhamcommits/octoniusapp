import express from 'express';
import { AuthsController } from '../controllers';
import { Auths } from '../../utils';

// Auth Controller with all the functions
const auth = new AuthsController();

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// POST - Signs In the user
routes.post('/sign-in', auth.signIn);

// POST - Add the user to the workplace
routes.post('/join-workspace', auth.joinWorkspace);

// POST - Signs In the user in the selected workspace and generate a new token
routes.post('/select-workspace', auth.selectWorkspace);

// GET - get number of users by an email
routes.get('/num-user-by-email-pwd', auth.getNumUsers);

// GET - get user workspaces
routes.get('/user-workspaces', auth.getUserWorkspaces);

// POST - Signs Up the user and creates a new account
routes.post('/sign-up', auth.signUp);

// POST - Signs Out the current loggedIn User
routes.post('/sign-out', authsHelper.verifyToken, authsHelper.isLoggedIn, auth.signOut);

// GET - Get other user details on the basis of email
routes.get('/email-exists', auth.getOtherUserByEmail);

// POST - Authenticate the user with sso
routes.post('/authenticate-sso-user', auth.authenticateSSOUsser);

// GET - obtain if the user can create new workspaces
routes.get('/blockNewWorkplaces', auth.isNewWorkplacesAvailable);

// GET - Get a list of all the workspaces with their integrations
routes.get('/all-workspaces-integrations', auth.getAllWorkspacesIntegrations);

// GET - Get a list of all the workspaces based on the domain of the account
routes.get('/allowed-workspaces', auth.getAllowedWorkspacesByDomain);

// GET - Check if the user is corretly signin and using the right token
routes.get('/right-token', authsHelper.verifyToken, authsHelper.isLoggedIn, auth.isRightAuthToken);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as authRoutes }