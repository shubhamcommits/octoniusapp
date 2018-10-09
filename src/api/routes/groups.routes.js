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

// !! - OLD To be removed !!
// router.get('/searchGroupUsers/:group_id', groupsController.searchGroupUsers);
router.get('/searchGroupUsers/:group_id/:query', groupsController.searchGroupUsers); // ! TO BE REMOVED
router.get('/:group_id', groupsController.getUserGroup); // ! TO BE REMOVED
router.post('/addNewUsers', groupsController.addNewUsersInGroup); // ! TO BE REMOVED
router.put('/:group_id', groupFileHandler, groupsController.updateGroup); // ! TO BE REMOVED
router.post('/removeUser', groupsController.removeUserFromGroup); // ! TO BE REMOVED

// -| Groups routes |-

// GET api/groups/:groupId/files
// - get user's files that belongs to this group
router.get('/:groupId/files',
  authorization.groupAccess,
  groups.getFiles);

// GET api/groups/:groupId/files/:fileName/download
// - download file from group
router.get('/:groupId/files/:fileName/download',
  authorization.groupAccess,
  groups.downloadFile);

// GET api/groups/:groupId/posts
// - get ten most recent group posts
router.get('/:groupId/posts',
  authorization.groupAccess,
  groups.getPosts);

// GET api/groups/:groupId/nextPosts/:postId
// - get next ten most recent posts (after :postId)
router.get('/:groupId/nextPosts/:postId',
  authorization.groupAccess,
  groups.getNextPosts);

module.exports = router;
