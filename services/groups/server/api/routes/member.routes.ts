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

// -| Group Members |-

// GET - Get a list of first 10 workspace members
routes.get('/', members.getGroupMembers);

// GET - Get a list of next 5 workspace members based on the lastUserId fetched from the first 10 workspace
routes.get('/next', members.getNextGroupMembers);

// POST - Add a new user to the group
routes.post('/add', members.addNewUserInGroup);

// DELETE - Removes a user from the group
routes.post('/remove', members.removeUserFromGroup);

// POST - Add user to BAR
routes.post('/addToBar', members.addUserToBar);

// Remove - Remove user from BAR
routes.post('/removeFromBar', members.removeUserFromBar);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as memberRoutes }