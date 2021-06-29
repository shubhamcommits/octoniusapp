import express from 'express';
import { GroupFunctions } from '../controllers';
import { Auths, groupFileHandler } from '../../utils';

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
routes.post('/auths/sign-out', authsHelper.signOut);

// GET - Get list of first 10 groups present in the database
routes.get('/list', group.getAllGroupsList);

// GET - Get list of next 5 groups present in the database based on the lastGroupId from fetched from the list of first 10 groups
routes.get('/list/next', group.getNextAllGroupsList);

// GET - Get group based on the groupId
routes.get('/:groupId', group.get);

// POST - Create new group in the workspace
routes.post('/', group.create);

// PUT - Updates the group data(only description and group_name)
routes.put('/:groupId', group.update);

// DELETE - Removes the group from the database
routes.delete('/:groupId', group.remove);

// PUT - Change the Group Image
routes.put('/:groupId/image', groupFileHandler, group.updateImage);

// GET - Get list of first 10 groups of which a user is a part of
routes.get('/', group.getUserGroups);

// GET - Get list of next 5 groups of which a user is a part of, based on the lastGroupId fetched from the list of first 10 groups
routes.get('/:lastGroupId/next', group.getNextUserGroups);

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

// PUT - Remove custom field value
routes.put('/:groupId/customFields/removeValue', group.removeCustomFieldValue);

// PUT - Add new value to a custom field
routes.put('/:groupId/settings/shareFiles', group.saveShareFilesSettings);

// PUT - Enable/Disable BAR
routes.put('/:groupId/settings/enableRights', group.enableRights);

// PUT - Enable/Disable Group Project Type
routes.put('/:groupId/settings/enabledProjectType', group.enabledProjectType);

// PUT - Enable/Disable Group Shuttle Type
routes.put('/:groupId/settings/enabledShuttleType', group.enabledShuttleType);

// PUT - Enable/Disable Group Shuttle Type
routes.put('/:groupId/settings/changeShuttleColumn', group.changeShuttleColumn);

// PUT - Add bar to group
routes.put('/:groupId/addBar', group.addBar);

//
routes.get('/:groupId/getBars', group.getBars);

// PUT - Remove bar from group and posts that are related to that bar
routes.put('/:groupId/removeBar', group.removeBar);

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

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as groupRoutes }