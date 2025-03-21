
import express from 'express';
import { FlowFunctions } from '../controllers';
import { Auths } from '../../utils';

const routes = express.Router();
const flow = new FlowFunctions();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// POST - Logout from the server
// routes.post('/auths/sign-out', authsHelper.signOut);

// POST - Add new automation flow
routes.post('/addAutomationFlow', flow.addAutomationFlow);

// DELETE - Delete an automation flow
routes.delete('/:flowId', flow.deleteFlow);

// GET - Get group automation flows
routes.get('/:groupId/getAutomationFlows', flow.getAutomationFlows);

// PUT - Update the flow name
routes.put('/updateFlowName', flow.updateFlowName);

// GET - Get flows steps
routes.get('/:flowId', flow.getFlow);

// PUT - Remove a step from the flow of the groups
routes.put('/removeFlowStep', flow.removeFlowStep);

// PUT - Save a step from the flow of the groups
routes.put('/:flowId/step', flow.saveStep);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as flowRoutes }