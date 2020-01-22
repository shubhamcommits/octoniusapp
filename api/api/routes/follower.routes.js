const followerController = require("../controllers/follower.controller");

const express = require('express');

const { users } = require('../controllers');

const { auth } = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

router.get('/:taskId', followerController.getFollowersForTask);
router.post('/', followerController.addToTask);
router.delete('/:taskId/:userId', followerController.remove);
module.exports = router;
