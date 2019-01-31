const express = require('express');
const bodyParser = require('body-parser');

const {
    billing
} = require('../controllers');

const router = express.Router();

// /// WEBHOOKS

// when a customer's payment failed
router.post('/paymentFailed', billing.paymentFailed);

// Trying to transform before the request
router.use(bodyParser.raw({ type: '*/*' }));

// When a customer's payment succeeded
router.post('/paymentSuccessful', billing.paymentSuccessful);

module.exports = router;
