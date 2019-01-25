const express = require('express');

const {
    billing
} = require('../controllers');

const router = express.Router();

// /// WEBHOOKS

// when a customer's payment failed
router.post('/paymentFailed', billing.paymentFailed);

// When a customer's payment succeeded
router.post('/paymentSuccessful', billing.paymentSuccessful);

module.exports = router;
