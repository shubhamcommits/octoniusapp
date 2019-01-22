const express = require('express');

const {
  billing
} = require('../controllers');

const {
    auth
} = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);


// create a subscription
router.post('/createSubscription', billing.createSubscription);

// get billing status
router.get('/getBillingStatus/:workspaceId', billing.getBillingStatus);

module.exports = router;
