import express from 'express';
import { Auths, workspaceFileUploader } from '../../utils';
import { WorkspaceController } from '../controllers';
import { ManagementControllers } from '../controllers/mgmt.controllers';

// Create Workspace controller Class
const workspaces = new WorkspaceController();

// Create Management controller Class
const mgmt = new ManagementControllers();

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// POST - Creates a new workspace
routes.post('/', workspaces.createNewWorkspace);

// GET - Checks the availability of the workspace name
routes.get('/check-availability', workspaces.checkWorkspaceAvailability);

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// POST - Logout from the server
// routes.post('/auths/sign-out', authsHelper.signOut);

// -| Workspace General |-

// GET - Get workspace details
routes.get('/:workspaceId', workspaces.getWorkspace);

// PUT - Edit the workspace details
routes.put('/:workspaceId', workspaceFileUploader, workspaces.updateWorkspace);

// PUT - Edit the workspace properties
routes.put('/:workspaceId/update', workspaceFileUploader, workspaces.updateWorkspaceProperties);

// POST - Invite the user
routes.post('/invite', workspaces.inviteUser);

// Get all unique email domains that belong within the given workspace that match the query.
routes.get('/emailDomains/:workspaceId/:query', workspaces.getUniqueEmailDomains);

// Get all unique job positions that belong within the given workspace that match the query.
routes.get('/jobPositions/:workspaceId/:query', workspaces.getUniqueJobPositions);

// Get all unique skills that belong within the given workspace that match the query.
routes.get('/skills/:workspaceId/:query', workspaces.getUniqueSkills);

// DELETE - Removes the workspace from the database
routes.delete('/:workspaceId', workspaces.remove);

/**
 * MGMT calls
*/
// POST - Create a customer client portal session
routes.post('/billing/create-client-portal-session', mgmt.createClientPortalSession);

// POST - Create a checkout portal session
routes.post('/billing/create-checkout-session', mgmt.createStripeCheckoutSession);

// GET - 
routes.get('/billing/get-checkout-session/:workspaceId/:sessionId', mgmt.getStripeCheckoutSession);

// GET - 
routes.get('/billing/get-billing-status/:workspaceId', mgmt.getBillingStatus);

// GET - To check if the workspace is on-premise or on the cloud
routes.get('/billing/can-activate-billing/:workspaceId', mgmt.canActivateBilling);

// GET - get subscription details
routes.get('/billing/get-subscription', mgmt.getSubscription);

// GET - check if the user can invite more people to the workspace
routes.get('/billing/can-invite-more-members/:workspaceId', mgmt.canInviteMoreMembers);

// GET - get customer details
routes.get('/billing/get-customer/:customerId', mgmt.getStripeCustomer);

// GET - check if the workspace has a individual subscription
routes.get('/billing/is-individual-subscription/:workspaceId', mgmt.checkIsIndividualSubscription);

// GET - check if the workspace has a business subscription
routes.get('/billing/is-business-subscription/:workspaceId', mgmt.checkIsBusinessSubscription);

// GET - get subscription
// routes.get('/billing/stripe-subscription', mgmt.getSubscription);

// GET - get subscription prices
// routes.get('/billing/get-subscription-prices', mgmt.getSubscriptionPrices);

// GET - 
routes.get('/:workspaceId/inTryOut', mgmt.isInTryOut);

// GET - obtain if the flamingo module is availability in the workspace
routes.get('/:workspaceId/flamingo', mgmt.getFlamingoStatus);

// GET - obtain if the idea module is availability in the workspace
routes.get('/:workspaceId/idea', mgmt.getIdeaStatus);

// GET - obtain if the excelImport module is availability in the workspace
routes.get('/:workspaceId/excelImport', mgmt.getExcelImportStatus);

// GET - obtain if the shuttle module is availability in the workspace
routes.get('/:workspaceId/shuttle', mgmt.isShuttleTasksModuleAvailable);

// GET - obtain if the filesVersions module is availability in the workspace
routes.get('/:workspaceId/filesVersions', mgmt.isFilesVersionsModuleAvailable);

// GET - obtain if the organization module is availability in the workspace
routes.get('/:workspaceId/organization', mgmt.isOrganizationModuleAvailable);

// GET - obtain if the chat module is availability in the workspace
routes.get('/:workspaceId/chat', mgmt.isChatModuleAvailable);

// GET - obtain if the filesVersions module is availability in the workspace
routes.get('/:workspaceId/lounge', mgmt.isLoungeAvailable);

// GET - obtain the base url of the workspace
routes.get('/:workspaceId/baseURL', mgmt.getWorkspaceBaseURL);

/**
 * Profile Custom Fields
 */
// PUT - Save custom field
routes.put('/:workspaceId/customFields', workspaces.addCustomField);

// GET - Get custom fields
routes.get('/:workspaceId/customFields', workspaces.getCustomFields);

// DELETE - Delete custom field
routes.delete('/:workspaceId/customFields/:fieldId', workspaces.removeCustomField);

// PUT - Add new value to a custom field
routes.put('/:workspaceId/customFields/addValue', workspaces.addCustomFieldValue);

// PUT - Remove custom field value
routes.put('/:workspaceId/customFields/removeValue', workspaces.removeCustomFieldValue);
/**
 * Profile Custom Fields ENDS
 */

// GET - Get a list of the groups which has shuttle flag active
routes.get('/:workspaceId/shuttleGroups', workspaces.getShuttleGroups);

// PUT - Save settings
routes.put('/:workspaceId/settings', workspaces.saveSettings);

// GET - Get a list of the members without manager
routes.get('/:workspaceId/organizationChartFirstLevel', workspaces.getOrganizationChartFirstLevel);

// GET - Get a list of the members with an specific manager
routes.get('/:workspaceId/organizationChartNextLevel', workspaces.getOrganizationChartNextLevel);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as workspaceRoutes }