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
routes.get('/:userId/entityInfor', controller.getEntityInfo);

// POST - Creates a new entity custom field
routes.post('/:entityId/cf', controller.createEntityCF);

// POST - Edits an entity custom field
routes.post('/:entityId/edit-cf', controller.editEntityCF);

// POST - Deletes an entity custom field
routes.post('/:entityId/delete-cf', controller.deleteEntityCF);

// POST - Creates a new entity benefit
routes.post('/:entityId/benefit', controller.createEntityBenefit);

// POST - Edits an entity benefit
routes.post('/:entityId/edit-benefit', controller.editEntityBenefit);

// POST - Deletes an entity benefit
routes.post('/:entityId/delete-benefit', controller.deleteEntityBenefit);

// POST - Creates a new entity days off
routes.post('/:entityId/days-off', controller.createEntityDaysOff);

// POST - Edits an entity days off
routes.post('/:entityId/edit-days-off', controller.editEntityDaysOff);

// POST - Deletes an entity days off
routes.post('/:entityId/delete-days-off', controller.deleteEntityDaysOff);

// POST - Adds a bank holiday to a days off year
routes.post('/:entityId/add-bank-holidays', controller.addBankHoliday);

// POST - Adds a bank holiday to a days off year
routes.post('/:entityId/remove-bank-holidays', controller.removeBankHoliday);

// GET - Returns all the members in an entity
routes.get('/:entityId/entityMembers', controller.getEntityMembers);

// POST - Removes a user from an entity
routes.post('/:entityId/removeMemberFromentity', controller.removeMemberFromEntity);

// POST - Add a user to an entity
routes.post('/:entityId/addMemberToEntity', controller.addMemberToEntity);

// POST - Add all users to an entity
routes.post('/:entityId/addAllMemberToEntity', controller.addAllMemberToEntity);

// GET - Returns top 4 members which are currently off
routes.get('/:workspaceId/topMembersOff', controller.getTopMembersOff);

// GET - Returns all members which are currently off
routes.get('/:workspaceId/membersOff', controller.getMembersOff);

// GET - Returns all members which are currently off
routes.get('/:workspaceId/hr-pending-notifications', controller.getHRPendingNotifications);

// POST - Mark a Notification as DONE
routes.post('/:notificationId/mark-notification-as-done', controller.markNotificationAsDone);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as hrRoutes }
