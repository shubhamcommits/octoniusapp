const express = require('express');

const { workspaceController } = require('../controllers');
const { auth, workspaceFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

router.get('/:workspace_id', workspaceController.getWorkspace);
router.get('/searchWorkspaceUsers/:workspace_id/:query', workspaceController.searchWorkspaceUsers);
// !!FrontEnd Error prevention: route was named by 'updateAllowedEmailsDoamins'
// Substitute by 2 new routes: as mentioned in Jira task description
router.post('/updateAllowedEmailDomains', workspaceController.updateAllowedEmailDomains);
router.post('/inviteUserViaEmail', workspaceController.inviteUserViaEmail);
router.put('/updateUserRole', workspaceController.updateUserRole);
// apply middleware to check permission, is workspace admin?
router.post('/removeUser', workspaceController.removeUserFromWorkspace);
router.put('/:workspace_id', workspaceFileHandler, workspaceController.updateWorkspace);
router.post('/groups', workspaceController.createNewGroup);
// !!! Check this why is that for????? !!!
router.get('/groups/:user_id/:workspace_id', workspaceController.getUserGroups);

module.exports = router;
