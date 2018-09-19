const express = require('express');

const { fileController } = require('../controllers');
const { auth } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// File Routes
router.post('/download', fileController.downloadFile);

module.exports = router;
