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

router.get('/getOtherUser/:userId', users.getOtherUser);

// Edit/Update user
router.put('/', cleanCache, users.edit);

// Update user profile image
router.put('/updateImage', fileHandler, cleanCache, users.updateImage);

// Get user's overview
router.get('/overview', users.getOverview);

/***
 * Jessie Jia Edit Starts
 */
// Get user's today overview
router.get('/overviewToday', users.getOverviewToday);

// Get user's overview of this coming week, sorted by due date
router.get('/overviewWeek', users.getOverviewWeek);

/***
 * Jessie Jia Edit Ends
 */

// Edit user skills
router.put('/skills', cleanCache, users.editSkills);

// - Tasks -

// Get user's to do/in progress tasks
router.get('/tasks', users.getTasks);

// Get 20 most recently created user's completed tasks
router.get('/tasksDone', users.getTasksDone);

// Get next 20 most recently created user's completed tasks
router.get('/nextTasksDone/:postId', users.getNextTasksDone);

// Get user's today to do/in progress/done tasks
router.get('/todayTasks', users.getTodayTasks);

// Get user's tasks of this coming week, sorted by due dateGet
router.get('/weeklyTasks', users.getThisWeekTasks);

// - Integrations -

// Get user token for a specific integration
router.get('/integrations/gdrive/token', users.getGdriveToken);

// Add a new token for a specific integration
router.post('/integrations/gdrive/token', users.addGdriveToken);

// - Events -

// Get user's today agenda events
router.get('/:userId/todayEvents', users.getTodayEvents);

// Get user's agenda events of this coming week, sorted by due date
router.get('/:userId/weeklyEvents', users.getThisWeekEvents);

module.exports = router;
