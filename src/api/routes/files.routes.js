const express = require('express');

const {
  files,
  filesController // ! TO BE REMOVED
} = require('../controllers');

const { auth } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// File Routes
router.post('/download', filesController.downloadFile); // ! TO BE REMOVED

module.exports = router;
