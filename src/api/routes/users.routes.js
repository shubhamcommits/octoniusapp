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

// GET api/users/tasks - get user's to do/in progress tasks
router.get('/tasks', users.getTasks);

// GET api/users/tasksDone - get 20 most recently created user's tasks
// that are completed
router.get('/tasksDone', users.getTasksDone);

// GET api/users/nextTasksDone/:postId - get next 20 most recently created
// users's tasks that are completed
router.get('/nextTasksDone/:postId', users.getNextTasksDone);

// !! TO BE REMOVED - User routes
router.get('/', usersController.getUser); // ! TO BE REMOVED
router.put('/', usersController.updateUser); // ! TO BE REMOVED
router.post('/updateImage', fileHandler, usersController.updateUserImage); // ! TO BE REMOVED

module.exports = router;
