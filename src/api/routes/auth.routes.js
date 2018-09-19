const express = require('express');

const { authController } = require('../controllers');
const { auth } = require('../../utils');

const router = express.Router();

// Auth core routes
router.post('/signin', authController.signIn);
router.post('/signup', authController.signUp);
router.get('/signout', auth.verifyToken, auth.isLoggedIn, authController.signOut);
router.post('/checkUserAvailability', authController.checkUserAvailability);
router.post('/createNewWorkspace', authController.createNewWorkspace);
router.post('/checkWorkspaceName', authController.checkWorkspaceName);

module.exports = router;
