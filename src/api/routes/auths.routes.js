const express = require('express');

const { auths } = require('../controllers');
const { auth } = require('../../utils');

const router = express.Router();

// Auth core routes
router.post('/signin', auths.signIn);
router.post('/signup', auths.signUp);
router.get('/signout', auth.verifyToken, auth.isLoggedIn, auths.signOut);
router.post('/checkUserAvailability', auths.checkUserAvailability);
router.post('/createNewWorkspace', auths.createNewWorkspace);
router.post('/checkWorkspaceName', auths.checkWorkspaceName);

module.exports = router;
