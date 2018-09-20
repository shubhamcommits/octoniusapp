const express = require('express');

const {
  groups,
  groupsController // ! TO BE REMOVED
} = require('../controllers');

const { auth, groupFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// Group Routes
// router.get('/searchGroupUsers/:group_id', groupsController.searchGroupUsers);
router.get('/searchGroupUsers/:group_id/:query', groupsController.searchGroupUsers); // ! TO BE REMOVED
router.get('/:group_id', groupsController.getUserGroup); // ! TO BE REMOVED
router.post('/addNewUsers', groupsController.addNewUsersInGroup); // ! TO BE REMOVED
router.put('/:group_id', groupFileHandler, groupsController.updateGroup); // ! TO BE REMOVED
router.post('/removeUser', groupsController.removeUserFromGroup); // ! TO BE REMOVED

module.exports = router;
