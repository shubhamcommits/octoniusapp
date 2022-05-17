import { Auths } from '../../utils';
import express from 'express';
import { BoxControllers } from '../controllers';

// Routes 
const routes = express.Router();

// Define skill controllers
const box = new BoxControllers();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// Add a new token for a specific integration
routes.get('/auth/:workspaceId', box.authBox);

routes.get('/token', box.getBoxToken);

routes.post('/token', box.addBoxToken);

routes.get('/boxUser', box.getBoxUser);

routes.post('/revokeToken', box.disconnectBoxCloud);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as boxRoutes }