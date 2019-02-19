const express = require('express');

const { users } = require('../controllers');

const { auth, cleanCache, fileHandler } = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// -| Users Routes |-

// - Main -

// Get current user
router.get('/', users.get);

// Edit/Update user
router.put('/', cleanCache, users.edit);

// Update user profile image
router.put('/updateImage', fileHandler, cleanCache, users.updateImage);

// Get user's overview
router.get('/overview', users.getOverview);

// Edit user skills
router.put('/skills', cleanCache, users.editSkills);

// - Tasks -

// Get user's to do/in progress tasks
router.get('/tasks', users.getTasks);

// Get 20 most recently created user's completed tasks
router.get('/tasksDone', users.getTasksDone);

// Get next 20 most recently created user's completed tasks
router.get('/nextTasksDone/:postId', users.getNextTasksDone);

// - Tokens -

// Get user token for a specific integration
router.get('/tokens/:service', users.getToken);

// Add a new token for a specific integration
router.post('/tokens/:service', users.addToken);

module.exports = router;
