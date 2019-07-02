const express = require('express');


const {
  workspaces,
  workspacesController // ! TO BE REMOVED
} = require('../controllers');

const { auth, cleanCache, workspaceFileHandler } = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// vvvv| BAD REST PATTERN, to be replaced! |vvvv
router.get('/:workspace_id', workspacesController.getWorkspace);
router.get('/searchWorkspaceUsers/:workspace_id/:query', workspacesController.searchWorkspaceUsers);
router.post('/inviteUserViaEmail', workspacesController.inviteUserViaEmail);
router.put('/updateUserRole', cleanCache, workspacesController.updateUserRole);
router.put('/:workspace_id', workspaceFileHandler, workspacesController.updateWorkspace);
router.post('/groups', workspacesController.createNewGroup);
router.get('/groups/:user_id/:workspace_id', workspacesController.getUserGroups);
// ^^^^| BAD REST PATTERN, to be replaced! |^^^^

// -| Workspaces routes |-

// - Domains -

// Add new domain to workspace's allowed domains
router.post('/:workspaceId/domains', workspaces.addDomain);

// Remove domain from workspace's allowed domains (and disable all users)
router.delete('/:workspaceId/domains/:domain', workspaces.deleteDomain);

// Get all workspace domains
router.get('/:workspaceId/domains', workspaces.getDomains);

// Get all unique email domains that belong within the given workspace.
router.get('/emailDomains/:workspaceId', workspaces.getUniqueEmailDomains);

// Get all unique job positions that belong within the given workspace.
router.get('/jobPositions/:workspaceId', workspaces.getUniqueJobPositions);

// Get all unique skills that belong within the given workspace.
router.get('/skills/:workspaceId', workspaces.getUniqueSkills);

// - Users -

// Remove user from workspace
router.delete('/:workspaceId/users/:userId', workspaces.deleteUser);

module.exports = router;
