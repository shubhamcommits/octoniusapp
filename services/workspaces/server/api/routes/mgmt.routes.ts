import express from 'express';
import { Auths } from '../../utils';
import { ManagementControllers } from '../controllers/mgmt.controllers';

// Create Domain controller Class
const controller = new ManagementControllers()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyMgmtAPIKey);

// DELETE - Removes the specify workspace remotelly from the mgmt portal
routes.delete('/:workspaceId', controller.removeWorkspace);

// DELETE - Removes the specify workspace remotelly from the mgmt portal
routes.delete('/removeUser/:userId', controller.removeUser);

// GET - Obtain all the information needed for the mgmt portal
routes.get('/:workspaceId', controller.getWorkspace);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as mgmtRoutes }