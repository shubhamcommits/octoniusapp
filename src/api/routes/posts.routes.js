const express = require('express');

const {
  posts,
  postsController // ! TO BE REMOVED
} = require('../controllers');

const {
  auth,
  authorization,
  postFileHandler
} = require('../../utils');

const router = express.Router();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// -| Post Routes |-

// vvvv| BAD REST PATTERN, to be replaced! |vvvv
router.post('/addComment', postsController.addCommentOnPost);
router.post('/like', postsController.likePost);
router.post('/unlike', postsController.unlikePost);
router.get('/userOverview/:user_id', postsController.getUserOverview);
// ^^^^| BAD REST PATTERN, to be replaced! |^^^^

// Get one post
router.get('/:postId', authorization.groupAccess, posts.get);

// Add new post
router.post('/', postFileHandler, posts.add);

// Edit post
router.put('/:postId', posts.edit);

// Delete post
router.delete('/:postId', posts.remove);

// - Comments -

// Add new comment on post
// router.post('/:postId/comment', posts.addComment); // To do

// Edit comment on post
// router.put('/:postId/comment/:commentId', posts.editComment); // To do

// Delete comment on post
// router.delete('/:postId/comment/:commentId', posts.editComment); // To do

// - Likes -

// Like post
// router.put('/:postId/like', posts.like); // To do

// Unlike post
// router.put('/:postId/unlike', posts.unlike); // To do

// - Tasks -

// Change task assignee
router.put('/:postId/taskAssignee', posts.changeTaskAssignee);

// Change task status
router.put('/:postId/taskStatus', posts.changeTaskStatus);

module.exports = router;
