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

// GET api/posts/:postId - get one post
router.get('/:postId', authorization.groupAccess, posts.get);

// POST api/posts/ - add new post
router.post('/', postFileHandler, posts.add);

// PUT api/posts/:postId - edit post
router.put('/:postId', posts.edit);

// DELETE api/posts/:postId - delete post
router.delete('/:postId', posts.remove);

// PUT api/posts/:postId/taskStatus - change task status
router.put('/:postId/taskStatus', posts.changeTaskStatus);

// POST api/posts/:postId/comment - add new comment on post
// router.post('/:postId/comment', posts.addComment); // To do
router.post('/addComment', postsController.addCommentOnPost); // ! TO BE REMOVED

// PUT api/posts/:postId/comment/:commentId - update comment
// router.put('/:postId/comment/:commentId', posts.editComment); // To do

// DELETE api/posts/:post_id/comment/:commentId - delete comment
// router.delete('/:postId/comment/:commentId', posts.editComment); // To do

// PUT api/posts/:postId/like - like post
// router.put('/:postId/like', posts.like); // To do
router.post('/like', postsController.likePost); // ! TO BE REMOVED

// PUT api/posts/:postId/unlike - unlike post
// router.put('/:postId/unlike', posts.unlike); // To do
router.post('/unlike', postsController.unlikePost); // ! TO BE REMOVED

// !!! move this one to groups routes !!!
router.get('/userOverview/:user_id', postsController.getUserOverview); // ! TO BE REMOVED

module.exports = router;
