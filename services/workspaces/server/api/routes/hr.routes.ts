import express from 'express';
import { Auths } from '../../utils';
import { HRControllers } from '../controllers';

// Create Domain controller Class
const controller = new HRControllers()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// POST - Creates a new entity
routes.post('/', controller.createEntity);

// GET - Returns the specify entity
routes.get('/:entityId', controller.getEntity);

// POST - Edit a property of an entity
routes.post('/:entityId', controller.editEntityProperty);

// GET - Returns all the entities in a workspace
routes.get('/', controller.getEntities);

// DELETE - Removes the specify entity
routes.delete('/:entityId', controller.removeEntity);

// POST - Creates a new entity variable
routes.post('/:entityId/variable', controller.createEntityVariable);

// POST - Edits an entity variable
routes.post('/:entityId/edit-variable', controller.editEntityVariable);

// POST - Deletes an entity variable
routes.post('/:entityId/delete-variable', controller.deleteEntityVariable);

// GET - Returns all the entities in a workspace
routes.get('/:userId/entityVariablesCF', controller.getEntityVariablesCF);

// POST - Creates a new entity custom field
routes.post('/:entityId/cf', controller.createEntityCF);

// POST - Edits an entity custom field
routes.post('/:entityId/edit-cf', controller.editEntityCF);

// POST - Deletes an entity custom field
routes.post('/:entityId/delete-cf', controller.deleteEntityCF);

// GET - Returns all the members in an entity
routes.get('/:entityId/entityMembers', controller.getEntityMembers);

// POST - Removes a user from an entity
routes.post('/:entityId/removeMemberFromentity', controller.removeMemberFromentity);

// POST - Add a user to an entity
routes.post('/:entityId/addMemberToEntity', controller.addMemberToEntity);

// POST - Add all users to an entity
routes.post('/:entityId/addAllMemberToEntity', controller.addAllMemberToEntity);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as hrRoutes }
