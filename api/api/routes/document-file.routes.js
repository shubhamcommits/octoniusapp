const express = require('express');
const { documentFile } = require('../controllers');

const router = express.Router();

const {
    auth
  } = require('../../utils');

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

router.get('/:postId', documentFile.getFile);

router.get('/group/:groupId', documentFile.getGroupFiles);

router.post('/', documentFile.createFile);

router.put('/:postId', documentFile.updateFile);

router.delete('/:postId', documentFile.deleteFile);

module.exports = router
