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

// - Main -

// Get one post
router.get('/:postId', authorization.groupAccess, posts.get);

// Add new post
router.post('/', postFileHandler, posts.add);

// Edit post
router.put('/:postId', posts.edit);

// Delete post
router.delete('/:postId', posts.remove);

// - Comments -

// Get post's comments
router.get('/:postId/comments', posts.getComments);

// Add new comment on post
router.post('/:postId/comments', posts.addComment);

// Edit comment on post
router.put('/:postId/comments/:commentId', posts.editComment);

// Delete comment on post
router.delete('/:postId/comments/:commentId', posts.removeComment);

// - Likes -

// Like post
router.put('/:postId/like', posts.like);

// Unlike post
router.put('/:postId/unlike', posts.unlike);

// - Tasks -

// Change task assignee
router.put('/:postId/taskAssignee', posts.changeTaskAssignee);

// Change task status
router.put('/:postId/taskStatus', posts.changeTaskStatus);

module.exports = router;
