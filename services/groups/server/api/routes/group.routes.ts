import express from 'express';
import { GroupFunctions } from '../controllers';
import { Auths, groupUploadFileHandler } from '../../utils';

const routes = express.Router();
const group = new GroupFunctions();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// POST - Logout from the server
// routes.post('/auths/sign-out', authsHelper.signOut);

// GET - Get list of first 10 groups present in the database
routes.get('/list', group.getAllGroupsList);

// GET - Get list of next 5 groups present in the database based on the lastGroupId from fetched from the list of first 10 groups
routes.get('/list/next', group.getNextAllGroupsList);

// GET - Get list of first 10 archived groups present in the database
routes.get('/list/archived', group.getAllArchivedGroupsList);

// GET - Get list of next 5 archived groups present in the database based on the lastGroupId from fetched from the list of first 10 groups
routes.get('/list/archived/next', group.getNextAllArchivedGroupsList);

// GET - Get list of active groups present in the database based on a query
routes.get('/search', group.getWorkspaceActiveGroups);

// GET - Get list of archived groups present in the database based on a query
routes.get('/search/archived', group.getWorkspaceArchivedGroups);

// GET - Get group based on the groupId
routes.get('/:groupId', group.get);

// GET - Get group based on the postId
routes.get('/:postId/byPost', group.getByPost);

// POST - Create new group in the workspace
routes.post('/', group.create);

// PUT - Updates the group data(only description and group_name)
routes.put('/:groupId', group.update);

// DELETE - Removes the group from the database
routes.delete('/:groupId', group.remove);

// DELETE - Archives the group from the database
routes.put('/:groupId/archive', group.archive);

// PUT - Change the Group Image
routes.put('/:groupId/image', groupUploadFileHandler, group.updateImage);

// GET - Get list of first 10 groups of which a user is a part of
routes.get('/', group.getUserGroups);

// GET - Get list of next 5 groups of which a user is a part of, based on the lastGroupId fetched from the list of first 10 groups
routes.get('/:lastGroupId/next', group.getNextUserGroups);

// GET - Get list of groups of which a user is a part of
routes.get('/:workspaceId/allUserGroups', group.getAllUserGroups);

// GET - Get list of groups of which a user is a manager
routes.get('/:workspaceId/allManagerGroups', group.getAllManagerGroups);

// GET - Get first 10 Agora groups not joined by user
routes.get('/agora/not-joined', group.getAgoraGroupsNotJoined);

// GET - Get next 5 Agora groups not joined by user
routes.get('/agora/not-joined-next', group.getNextAgoraGroupsNotJoined);

// POST - User  join Agora group
routes.post('/agora/join', group.joinAgoraGroup);

// PUT - Save custom field
routes.put('/:groupId/customFields', group.addCustomField);

// GET - Get custom fields
routes.get('/:groupId/customFields', group.getCustomFields);

// DELETE - Delete custom field
routes.delete('/:groupId/customFields/:fieldId', group.removeCustomField);

// PUT - Add new value to a custom field
routes.put('/:groupId/customFields/addValue', group.addCustomFieldValue);

// PUT - Set the CF to be displayed in the kanban card
routes.put('/:groupId/customFields/displayInKanbanCard', group.setCustomFieldDisplayKanbanCard);

// PUT - Set the CF color to be displayed
routes.put('/:groupId/customFields/color', group.setCustomFieldColor);

// PUT - Remove custom field value
routes.put('/:groupId/customFields/removeValue', group.removeCustomFieldValue);

// PUT - Save custom field
routes.put('/:groupId/filesCustomFields', group.addFilesCustomField);

// GET - Get custom fields
routes.get('/:groupId/filesCustomFields', group.getFilesCustomFields);

// DELETE - Delete custom field
routes.delete('/:groupId/filesCustomFields/:fieldId', group.removeFilesCustomField);

// PUT - Add new value to a custom field
routes.put('/:groupId/filesCustomFields/addValue', group.addFilesCustomFieldValue);

// PUT - Set the CF color to be displayed
routes.put('/:groupId/filesCustomFields/color', group.setFilesCustomFieldColor);

// PUT - Remove custom field value
routes.put('/:groupId/filesCustomFields/removeValue', group.removeFilesCustomFieldValue);

// PUT - Save a settings property
routes.put('/:groupId/settings', group.saveSettings);

// PUT - Enable/Disable Group Shuttle Type
routes.put('/:groupId/settings/selectShuttleSection', group.selectShuttleSection);

// PUT - Add rag to group
routes.put('/:groupId/addRag', group.addRag);

//
routes.get('/:groupId/getRags', group.getRags);

// PUT - Remove rag from group and posts that are related to that rag
routes.put('/:groupId/removeRag', group.removeRag);

// Update a smart group with the given rules.
routes.post('/smart/:groupId', group.updateSmartGroup);

// Get a smart group's settings
routes.get('/smart/:groupId/settings', group.getSmartGroupSettings);

// Delete a smart group's rule
routes.put('/smart/:groupId/:rule/:customFieldId', group.deleteSmartGroupRule);

// Update a smart group's members
routes.put('/smart/:groupId', group.updateSmartGroupMembers);

routes.get('/workspace/groups', group.getWorkspaceGroups);

// PUT - Updates the project status
routes.put('/project/status', group.updateStatus);

// GET - Get number of posts
routes.get('/:groupId/postsCount', group.getPostsCount);

// GET - Get group tasks between two dates
routes.get('/:groupId/tasks-between-days', group.getTasksBetweenDates);

// PUT - Updates the widgets to show in the group
routes.put('/:groupId/saveSelectedWidgets', group.saveSelectedWidgets);

// GET - Get group shuttle tasks
routes.get('/:groupId/shuttleTasks', group.getShuttleTasks);

// PUT - Updates the settings of the custom fields table dialog in the group
routes.put('/:groupId/saveCustomFieldsSettings', group.saveCustomFieldsSettings);
/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as groupRoutes }