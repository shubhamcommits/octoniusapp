import express from 'express';
import { PasswordsControllers } from '../controllers';

const passwords = new PasswordsControllers();

// Routes List
const routes = express.Router();

// PUT - reset user password
routes.put('/reset', passwords.resetPassword);

// POST - send reset password email
routes.post('/send-mail', passwords.sendResetPasswordMail);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as passwordRoutes }