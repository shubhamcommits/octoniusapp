const express = require('express');

const {
  auths,
  authsController // ! TO BE REMOVED
} = require('../controllers');

const { auth } = require('../../utils');

const router = express.Router();

// Auth core routes
router.post('/signin', authsController.signIn); // ! TO BE REMOVED
router.post('/signup', authsController.signUp); // ! TO BE REMOVED
router.get('/signout', auth.verifyToken, auth.isLoggedIn, authsController.signOut); // ! TO BE REMOVED
router.post('/checkUserAvailability', authsController.checkUserAvailability); // ! TO BE REMOVED
router.post('/createNewWorkspace', authsController.createNewWorkspace); // ! TO BE REMOVED
router.post('/checkWorkspaceName', authsController.checkWorkspaceName); // ! TO BE REMOVED

module.exports = router;
