const express = require('express');

const {
  users,
  usersController // ! TO BE REMOVED
} = require('../controllers');

const { auth, fileHandler } = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// -| Users Routes |-

// vvvv| BAD REST PATTERN, to be replaced! |vvvv
router.get('/', usersController.getUser); // ! TO BE REMOVED
router.put('/', usersController.updateUser); // ! TO BE REMOVED
router.post('/updateImage', fileHandler, usersController.updateUserImage); // ! TO BE REMOVED
// ^^^^| BAD REST PATTERN, to be replaced! |^^^^

// - Main -

// Get user's overview
router.get('/overview', users.getOverview);

// - Tasks -

// Get user's to do/in progress tasks
router.get('/tasks', users.getTasks);

// Get 20 most recently created user's completed tasks
router.get('/tasksDone', users.getTasksDone);

// Get next 20 most recently created user's completed tasks
router.get('/nextTasksDone/:postId', users.getNextTasksDone);

module.exports = router;
