const express = require('express');

const {
  workspaces,
  workspacesController // ! TO BE REMOVED
} = require('../controllers');

const { auth, workspaceFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

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

module.exports = router;
