/*  =============
 *  -- IMPORTS --
 *  =============
 */
const express = require('express');

const { pulse } = require('../controllers');

const { auth } = require('../../utils');

const router = express.Router();

// --| Authentication |--

// Verify token and add current userId to request data
router.use(auth.verifyToken);

// Check if user is logged in
router.use(auth.isLoggedIn);

// Get first 10 groups present in the workplace for pulse
router.get('/groups', pulse.getPulseGroups);

// Get next 5 groups present in the workplace for pulse
router.get('/nextGroups', pulse.getNextPulseGroups);

/*  =============
 *  -- EXPORTS --
 *  =============
 */
module.exports =  router;