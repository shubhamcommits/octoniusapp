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

// PUT - change flamingo module availability
routes.put('/:workspaceId/flamingo', controller.setFlamingo);

// DELETE - Removes the specify workspace
routes.delete('/:workspaceId', controller.removeWorkspace);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as mgmtRoutes }