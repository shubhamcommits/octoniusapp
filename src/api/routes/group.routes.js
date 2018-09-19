const express = require('express');

const { groupController } = require('../controllers');
const { auth, groupFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// Group Routes
// router.get('/searchGroupUsers/:group_id', groupController.searchGroupUsers);
router.get('/searchGroupUsers/:group_id/:query', groupController.searchGroupUsers);
router.get('/:group_id', groupController.getUserGroup);
router.post('/addNewUsers', groupController.addNewUsersInGroup);
router.put('/:group_id', groupFileHandler, groupController.updateGroup);
router.post('/removeUser', groupController.removeUserFromGroup);

module.exports = router;
