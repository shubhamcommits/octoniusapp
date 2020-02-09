import express, { Router } from 'express';
import { AuthsController } from '../controllers';

const auth = new AuthsController();

const routes = express.Router();

// POST - Signs In the user and generate a new token
routes.post('/signin', auth.signIn);

// POST - Signs Up the user and creates a new account
routes.post('/signup', auth.signUp);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as authRoutes }