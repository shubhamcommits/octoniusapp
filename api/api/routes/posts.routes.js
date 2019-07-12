const express = require('express');

const { posts } = require('../controllers');

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

// Add files to server of quill js
router.post('/upload', postFileHandler, posts.upload);

// Edit post
router.put('/:postId', posts.edit);

// Delete post
router.delete('/:postId', posts.remove);

// Mark post as read
router.put('/read/:postId', posts.markPostAsRead);

// - Comments -

// Get a single comment
router.get('/comments/:commentId', posts.getComment);

// Get first N post's comments
router.get('/:postId/comments', posts.getComments);

// Get next N post's comments
router.get('/:postId/nextComments/:commentId', posts.getNextComments);

// Add new comment on post
router.post('/:postId/comments', posts.addComment);

// Edit comment on post
router.put('/comments/:commentId', posts.editComment);

// Delete comment on post
router.delete('/comments/:commentId', posts.removeComment);

// Mark comment as read
router.put('/comments/read/:commentId', posts.markCommentAsRead);

// - Documents -

// Get a document
router.get('/documents/:postId', posts.getDocument);

// Get documennt edit history
router.get('/documents/history/:postId', posts.getDocumentHistory);

// Add authors to a document
router.post('/documents/:postId/addAuthor', posts.addDocumentAuthor);

// Fetch all the authors of a document
router.get('/documents/:postId/authors', posts.getDocumentAuthors);

// - Likes -

// Like post
router.put('/:postId/like', posts.like);

// Unlike post
router.put('/:postId/unlike', posts.unlike);

// Like comment
router.put('/comments/:commentId/like', posts.likeComment);

// Unlike comment
router.put('/comments/:commentId/unlike', posts.unlikeComment);

// - Follow -

// Follow post
router.put('/:postId/follow', posts.follow);

// Unfollow post
router.put('/:postId/unfollow', posts.unfollow);

// - Tasks -

// Change task assignee
router.put('/:postId/taskAssignee', posts.changeTaskAssignee);

// Change task status
router.put('/:postId/taskStatus', posts.changeTaskStatus);

// - Table Cells -
router.get('/table/cells/:postId', posts.getFormattedTableCells);

router.post('/table/cells/:postId/addCell', posts.insertFormattedTableCells);


module.exports = router;
