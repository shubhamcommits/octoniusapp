const express = require('express');

const { files } = require('../controllers');
const { auth } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// File Routes
router.post('/download', files.downloadFile);

module.exports = router;
