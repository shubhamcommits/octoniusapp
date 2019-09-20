const express = require('express');
const { groupSectionFiles } = require('../controllers');

const router = express.Router();

const {
    auth,
    authorization,
    postFileHandler
  } = require('../../utils');

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

router.post('/:groupId/FilesUpload/:userId',postFileHandler,groupSectionFiles.addGroupUploadedFiles);

router.get('/:groupId/allGroupFiles', authorization.groupAccess, groupSectionFiles.getAllFilesFromGroup);

router.get('/:groupId/next/allGroupFiles/:nextFiles', authorization.groupAccess, groupSectionFiles.getNextFilesFromGroup);

router.post('/:groupId/DeleteFiles/:filePostType', authorization.groupAccess, groupSectionFiles.deleteGroupFiles)

module.exports = router
