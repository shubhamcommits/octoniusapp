import express from 'express';
import { ResourcesController } from '../controllers';
import { Auths, companyFileUploader } from '../../utils';

const routes = express.Router();
const resources = new ResourcesController();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// POST - Create new resource in the group
routes.post('/', resources.create);

// PUT - Save a property
routes.put('/:resourceId/updateProperty', resources.updateProperty);

// GET - Get Resource by ID
routes.get('/:resourceId', resources.getResourceDetails);

// DELETE - Delete Resource by ID
routes.delete('/:resourceId', resources.deleteResource);

// GET - Get Resources
routes.get('/:groupId/all', resources.getResources);

// PUT - Save Resource custom field
routes.put('/:groupId/resourcesCustomFields', resources.addResourceCustomField);

// GET - Get Resource custom fields
routes.get('/:groupId/resourcesCustomFields', resources.getResourceCustomFields);

// DELETE - Delete Resource custom field
routes.delete('/:groupId/resourcesCustomFields/:fieldId', resources.removeResourceCustomField);

// PUT - Add new value to a Resource custom field
routes.put('/:groupId/resourcesCustomFields/addValue', resources.addResourceCustomFieldValue);

// PUT - Set the Resource CF to be displayed in the kanban card
// routes.put('/:groupId/resourcesCustomFields/displayInKanbanCard', resources.setResourceCustomFieldDisplayKanbanCard);

// PUT - Set the Resource CF color to be displayed
routes.put('/:groupId/resourcesCustomFields/color', resources.setResourceCustomFieldColor);

// PUT - Remove Resource custom field value
routes.put('/:groupId/resourcesCustomFields/removeValue', resources.removeResourceCustomFieldValue);

// PUT - Save custom field to show
routes.put('/:groupId/customFieldsToShow', resources.updateCustomFieldsToShow);

// PUT - Change custom field value
routes.put('/:resourceId/customField', resources.saveCustomField);

// PUT - Save new activity
routes.put('/:resourceId/activityEntry', resources.addActivityEntity);

// POST - Edit activity
routes.post('/:resourceId/activityEntry/:activityEntityId', resources.editActivityEntity);

// DELETE - Delete activity
routes.delete('/:resourceId/removeActivityEntry/:activityEntityId', resources.removeActivityEntry);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as resourcesRoutes }