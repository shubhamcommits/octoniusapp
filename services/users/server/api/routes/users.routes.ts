import { Auths } from '../../utils';
import express from 'express';
import { UserControllers } from '../controllers';

const routes = express.Router();

// Define user controllers
const user = new UserControllers();

// Define auths helper controllers
const auths = new Auths();

// -| Authentication |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// GET - Get current loggedIn user on the basis of userId
routes.get('/', user.get);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as userRoutes }