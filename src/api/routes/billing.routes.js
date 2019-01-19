const express = require('express');

const {
  billing
} = require('../controllers');

const router = express.Router();

// create a subscription
router.post('/createSubscription', billing.createSubscription);

module.exports = router;
