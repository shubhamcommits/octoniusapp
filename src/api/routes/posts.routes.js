const express = require('express');

const {
  posts,
  postsController // ! TO BE REMOVED
} = require('../controllers');

const { auth, authorization, postFileHandler } = require('../../utils');

const router = express.Router();

// Authentication
router.use(auth.verifyToken);
router.use(auth.isLoggedIn);

// Post Routes

// POST api/posts/ - add new post
router.post('/', postFileHandler, posts.add); // To do
router.post('/add', postFileHandler, postsController.addNewPost); // ! TO BE REMOVED

// PUT api/posts/:postId - edit post
// router.put('/:postId', authorization.toEditPost, posts.edit); // To do
router.post('/edit', authorization.toEditPost, postsController.editPost); // ! TO BE REMOVED

// DELETE api/posts/:postId - delete post
// router.delete('/:postId', authorization.todDeletePost, posts.delete); // To do
router.put('/', postsController.deletePost); // ! TO BE REMOVED

// POST api/posts/:postId/comment - add new comment on post
// router.post('/:postId/comment', posts.addComment); // To do
router.post('/addComment', postsController.addCommentOnPost); // ! TO BE REMOVED

// PUT api/posts/:postId/comment/:commentId - update comment
// router.put('/:postId/comment/:commentId', posts.editComment); // To do

// DELETE api/posts/:post_id/comment/:commentId - delete comment
// router.delete('/:postId/comment/:commentId', posts.editComment); // To do

// PUT api/posts/:postId/complete - mark post as complete
// router.put('/:postId/complete', authorization.toCompletePost, posts.complete); // To do
router.post('/complete', authorization.toCompletePost, postsController.completePost); // ! TO BE REMOVED

// PUT api/posts/:postId/like/:userId - like post
// router.put('/:postId/like/:userId', posts.like); // To do
router.post('/like', postsController.likePost); // ! TO BE REMOVED

// PUT api/posts/:postId/unlike/:userId - unlike post
// router.put('/:postId/unlike/:userId', posts.unlike); // To do
router.post('/unlike', postsController.unlikePost); // ! TO BE REMOVED

// !!! move this ones to groups routes !!!
router.get('/:group_id', postsController.getGrouppostsController); // ! TO BE REMOVED
router.get('/next/:group_id/:last_post_id', postsController.getGroupNextpostsController); // ! TO BE REMOVED

// !!! move this one to groups routes !!!
router.get('/userOverview/:user_id', postsController.getUserOverview); // ! TO BE REMOVED

module.exports = router;
