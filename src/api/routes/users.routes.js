const express = require('express');

const { users } = require('../controllers');
const { auth, fileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// User routes
router.get('/', users.getUser);
router.put('/', users.updateUser);
router.post('/updateImage', fileHandler, users.updateUserImage);

module.exports = router;
