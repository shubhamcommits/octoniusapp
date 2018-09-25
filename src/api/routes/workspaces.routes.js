const express = require('express');

const {
  workspaces,
  workspacesController // ! TO BE REMOVED
} = require('../controllers');

const { auth, workspaceFileHandler } = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// !! - OLD To be removed !!
router.get('/:workspace_id', workspacesController.getWorkspace); // ! TO BE REMOVED
router.get('/searchWorkspaceUsers/:workspace_id/:query', workspacesController.searchWorkspaceUsers); // ! TO BE REMOVED
// !!FrontEnd Error prevention: route was named by 'updateAllowedEmailsDoamins'
// Substitute by 2 new routes: as mentioned in Jira task description
router.post('/updateAllowedEmailDomains', workspacesController.updateAllowedEmailDomains); // ! TO BE REMOVED
router.post('/inviteUserViaEmail', workspacesController.inviteUserViaEmail); // ! TO BE REMOVED
router.put('/updateUserRole', workspacesController.updateUserRole); // ! TO BE REMOVED
// apply middleware to check permission, is workspace admin?
router.post('/removeUser', workspacesController.removeUserFromWorkspace); // ! TO BE REMOVED
router.put('/:workspace_id', workspaceFileHandler, workspacesController.updateWorkspace); // ! TO BE REMOVED
router.post('/groups', workspacesController.createNewGroup); // ! TO BE REMOVED
// !!! Check this why is that for????? !!!
router.get('/groups/:user_id/:workspace_id', workspacesController.getUserGroups); // ! TO BE REMOVED

// -| Workspaces routes |-

// POST api/workspaces/:workspaceId/domains - add new domain to workpsace's allowed domains
router.post('/:workspaceId/domains', workspaces.addDomain);

// DELETE api/workspaces/:workspaceId/domains - remove domain from workpsace's allowed domains
//    ( it remove/disable all users that belongs to this domain )
router.delete('/:workspaceId/domains', workspaces.deleteDomain);

// GET api/workspaces/:workspaceId/domains - get all workspace domains
router.get('/:workspaceId/domains', workspaces.getDomains);


module.exports = router;
