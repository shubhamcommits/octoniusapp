const express = require('express');

const {
  auths,
  authsController // ! TO BE REMOVED
} = require('../controllers');

const { auth } = require('../../utils');

const router = express.Router();

// Auth core routes
router.post('/signin', authsController.signIn); // ! TO BE REMOVED
router.get('/signout', auth.verifyToken, auth.isLoggedIn, authsController.signOut); // ! TO BE REMOVED
router.post('/checkUserAvailability', auths.checkUserAvailability); // ! TO BE REMOVED


router.post('/checkWorkspaceName', authsController.checkWorkspaceName); // ! TO BE REMOVED

// Create a new workspace
router.post('/createNewWorkspace', auths.createNewWorkspace);

// Check validity of user subscription
router.get('/checkSubscriptionValidity/:userId', auths.checkSubscriptionValidity);

// User signup
router.post('/signup', auths.signUp);


// =================
//    RESET PWD
// =================

// reset user password
router.put('/resetPassword', auths.resetPassword);

// send reset password email
router.post('/sendResetPasswordMail', auths.sendResetPasswordMail);

// get reset password details
router.get('/resetPasswordDetails/:id', auths.resetPasswordDetails);


module.exports = router;
