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

// GET - Get a list of first 10 members
routes.get('/', members.getGroupMembers);

// GET - Get a list of next 5 members based on the lastUserId fetched from the first 10 workspace
routes.get('/next', members.getNextGroupMembers);

// GET - Get a list of first group members with their social stats
routes.get('/social-stats', members.getGroupMembersSocialStats);

// GET - Get a list of members
routes.get('/all', members.getAllGroupMembers);

// POST - Add a new user to the group
routes.post('/add', members.addNewUserInGroup);

// DELETE - Removes a user from the group
routes.post('/remove', members.removeUserFromGroup);

// POST - Add user to RAG
routes.post('/addToRag', members.addUserToRag);

// Remove - Remove user from RAG
routes.post('/removeFromRag', members.removeUserFromRag);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as memberRoutes }