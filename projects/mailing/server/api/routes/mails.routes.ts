import { sendMail } from '../../utils';
import express from 'express';

// Routes List
const routes = express.Router();

// POST - Signup email confirmation
routes.post('/sign-up', sendMail.signup);;

// POST - Reset password
routes.post('/reset-password', sendMail.resetPassword);

// POST - Reset password
routes.post('/new-workspace', sendMail.newWorkspace);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as mailRoutes }
