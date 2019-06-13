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

// vvvv| BAD REST PATTERN, to be replaced! |

router.get('/searchGroupUsers/:group_id/:query', groupsController.searchGroupUsers);

router.post('/addNewUsers', groupsController.addNewUsersInGroup);
router.put('/:group_id', groupFileHandler, groupsController.updateGroup);
router.post('/removeUser', groupsController.removeUserFromGroup);

// ^^^^| BAD REST PATTERN, to be replaced! |^^^^

// -| Groups routes |-

// - Main -

// Get group
router.get('/:group_id', groups.get);

// Get user's private group
router.get('/user/private', groups.getPrivate);

// Get all groups associated with the current user in a given workspace
router.get('/user/:workspace', groups.getAllForUser);

// Get all public groups
router.get('/public/all', groups.getPublicGroups);

// Add a new member into a public group
router.post('/public/:groupId', groups.addNewMember);

// - Files -

// Get user's files that belongs to this group
router.get('/:groupId/files',
  authorization.groupAccess,
  groups.getFiles);

// Download file from group
router.get('/:groupId/files/:fileName/download',
  authorization.groupAccess,
  groups.downloadFile);

// Check Doc file to import into group doc
router.get('/:groupId/docImport',
  authorization.groupAccess,
  groups.getDocFileForEditorImport);

// - Posts -

// Get ten most recent group posts
router.get('/:groupId/posts',
  authorization.groupAccess,
  groups.getPosts);

// Get next ten most recent posts (after :postId)
router.get('/:groupId/nextPosts/:postId',
  authorization.groupAccess,
  groups.getNextPosts);

// get group's calendar posts
router.get('/:groupId/calendar/:year/:month',
  authorization.groupAccess,
  groups.getCalendarPosts);

// get user's calendar posts
router.get('/:groupId/user/:userId/calendar/:year/:month',
authorization.groupAccess,
groups.getUserCalendarPosts);

// get group's filtered posts
router.get('/:groupId/getFilteredPosts',
  authorization.groupAccess,
  groups.getFilteredPosts);

// get group's next filtered posts
router.get('/:groupId/:alreadyLoaded/getNextFilteredPosts',
    authorization.groupAccess,
    groups.getNextFilteredPosts);

// - Tasks -

// Get group's to do/in progress tasks
router.get('/:groupId/tasks', groups.getTasks);

// Get 20 most recently created group's completed tasks
router.get('/:groupId/tasksDone', groups.getTasksDone);

// Get next 20 most recently created group's completed tasks
router.get('/:groupId/nextTasksDone/:postId', groups.getNextTasksDone);

module.exports = router;
