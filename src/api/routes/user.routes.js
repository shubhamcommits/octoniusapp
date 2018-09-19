const express = require('express');

const { userController } = require('../controllers');
const { auth, fileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// User routes
router.get('/', userController.getUser);
router.put('/', userController.updateUser);
router.post('/updateImage', fileHandler, userController.updateUserImage);

module.exports = router;
