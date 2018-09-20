const express = require('express');

const { groups } = require('../controllers');
const { auth, groupFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// Group Routes
// router.get('/searchGroupUsers/:group_id', groups.searchGroupUsers);
router.get('/searchGroupUsers/:group_id/:query', groups.searchGroupUsers);
router.get('/:group_id', groups.getUserGroup);
router.post('/addNewUsers', groups.addNewUsersInGroup);
router.put('/:group_id', groupFileHandler, groups.updateGroup);
router.post('/removeUser', groups.removeUserFromGroup);

module.exports = router;
