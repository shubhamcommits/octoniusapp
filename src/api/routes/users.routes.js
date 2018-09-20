const express = require('express');

const {
  users,
  usersController // ! TO BE REMOVED
} = require('../controllers');

const { auth, fileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// User routes
router.get('/', usersController.getUser); // ! TO BE REMOVED
router.put('/', usersController.updateUser); // ! TO BE REMOVED
router.post('/updateImage', fileHandler, usersController.updateUserImage); // ! TO BE REMOVED

module.exports = router;
