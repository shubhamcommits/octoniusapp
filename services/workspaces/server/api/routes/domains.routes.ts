import express from 'express';
import { Auths } from '../../utils';
import { DomainControllers } from '../controllers';

// Create Domain controller Class
const domain = new DomainControllers()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// -| Workspace Domains |-

// GET - Get all workspace domains
routes.get('/', domain.getDomains);

// POST - Add new domain to workspace's allowed domains
routes.post('/', domain.addDomain);

// DELETE - Removes the domain from the workspace allowed domains
routes.delete('/:domain', domain.removeDomain);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as domainRoutes }