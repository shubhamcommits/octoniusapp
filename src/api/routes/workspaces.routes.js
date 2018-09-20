const express = require('express');

const { workspaces } = require('../controllers');
const { auth, workspaceFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

router.get('/:workspace_id', workspaces.getWorkspace);
router.get('/searchWorkspaceUsers/:workspace_id/:query', workspaces.searchWorkspaceUsers);
// !!FrontEnd Error prevention: route was named by 'updateAllowedEmailsDoamins'
// Substitute by 2 new routes: as mentioned in Jira task description
router.post('/updateAllowedEmailDomains', workspaces.updateAllowedEmailDomains);
router.post('/inviteUserViaEmail', workspaces.inviteUserViaEmail);
router.put('/updateUserRole', workspaces.updateUserRole);
// apply middleware to check permission, is workspace admin?
router.post('/removeUser', workspaces.removeUserFromWorkspace);
router.put('/:workspace_id', workspaceFileHandler, workspaces.updateWorkspace);
router.post('/groups', workspaces.createNewGroup);
// !!! Check this why is that for????? !!!
router.get('/groups/:user_id/:workspace_id', workspaces.getUserGroups);

module.exports = router;
