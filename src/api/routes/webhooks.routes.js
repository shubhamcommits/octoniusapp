const express = require('express');
const bodyParser = require('body-parser');

const {
    billing
} = require('../controllers');

const router = express.Router();

// /// WEBHOOKS

// when a customer's payment failed
router.post('/paymentFailed', billing.paymentFailed);

// When a customer's payment succeeded
router.post('/paymentSuccessful', bodyParser.raw({ type: '*/*' }), billing.paymentSuccessful);

module.exports = router;
