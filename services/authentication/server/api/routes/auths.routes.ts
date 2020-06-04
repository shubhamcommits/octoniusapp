import express from 'express';
import { AuthsController } from '../controllers';
import { Auths } from '../../utils';

// Auth Controller with all the functions
const auth = new AuthsController();

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// POST - Signs In the user and generate a new token
routes.post('/sign-in', auth.signIn);

// POST - Signs Up the user and creates a new account
routes.post('/sign-up', auth.signUp);

// POST - Signs Out the current loggedIn User
routes.post('/sign-out', authsHelper.verifyToken, authsHelper.isLoggedIn, auth.signOut);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as authRoutes }