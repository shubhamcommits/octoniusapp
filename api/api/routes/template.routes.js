const templateController = require("../controllers/template.controller");

const express = require('express');

const { users } = require('../controllers');

const { auth, cleanCache, fileHandler } = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);


router.get('/:groupId', templateController.getAll);


module.exports = router;
