const express = require('express');

const { postController } = require('../controllers');
const { auth, authorization, postFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// Post Routes
router.post('/add', postFileHandler, postController.addNewPost);
router.post('/edit', authorization.toEditPost, postController.editPost);
router.post('/complete', authorization.toCompletePost, postController.completePost);
router.post('/addComment', postController.addCommentOnPost);
router.post('/like', postController.likePost);
router.post('/unlike', postController.unlikePost);
router.get('/:group_id', postController.getGroupPosts);
router.get('/next/:group_id/:last_post_id', postController.getGroupNextPosts);
router.get('/userOverview/:user_id', postController.getUserOverview);
router.put('/', postController.deletePost);

module.exports = router;
