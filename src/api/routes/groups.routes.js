const express = require('express');

const {
  groups,
  groupsController // ! TO BE REMOVED
} = require('../controllers');

const {
  auth,
  authorization,
  groupFileHandler
} = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// vvvv| BAD REST PATTERN, to be replaced! |vvvv
// router.get('/searchGroupUsers/:group_id', groupsController.searchGroupUsers);
router.get('/searchGroupUsers/:group_id/:query', groupsController.searchGroupUsers);
router.get('/:group_id', groupsController.getUserGroup);
router.post('/addNewUsers', groupsController.addNewUsersInGroup);
router.put('/:group_id', groupFileHandler, groupsController.updateGroup);
router.post('/removeUser', groupsController.removeUserFromGroup);
// ^^^^| BAD REST PATTERN, to be replaced! |^^^^

// -| Groups routes |-

// - Files -

// Get user's files that belongs to this group
router.get('/:groupId/files',
  authorization.groupAccess,
  groups.getFiles);

// Download file from group
router.get('/:groupId/files/:fileName/download',
  authorization.groupAccess,
  groups.downloadFile);

// - Posts -

// Get ten most recent group posts
router.get('/:groupId/posts',
  authorization.groupAccess,
  groups.getPosts);

// Get next ten most recent posts (after :postId)
router.get('/:groupId/nextPosts/:postId',
  authorization.groupAccess,
  groups.getNextPosts);

// - Tasks -

// Get group's to do/in progress tasks
router.get('/:groupId/tasks', groups.getTasks);

// Get 20 most recently created group's completed tasks
router.get('/:groupId/tasksDone', groups.getTasksDone);

// Get next 20 most recently created group's completed tasks
router.get('/:groupId/nextTasksDone/:postId', groups.getNextTasksDone);

module.exports = router;
