import express from 'express';
import { CommentsController } from '../controllers';
import { Auths, commentFileHandler } from '../utils';

const router = express.Router();
const commentsController = new CommentsController();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
router.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
router.use(auths.isLoggedIn);

// This route is used to add a new comment
router.post('/new-comment', commentFileHandler, commentsController.addComment);

// This route is used to edit a comment
router.post('/:commentId/edit-comment', commentFileHandler, commentsController.editComment);

// This route is used to retrieve a comment
router.get('/:commentId/get-comment', commentsController.getComment);

// This route is used to get first 5 comments
router.get('/allComments', commentsController.getAllComments);

// This route is used to get first 5 comments
router.get('/comments', commentsController.getComments);

// This route is used to get next 5 comments
router.get('/next-comments', commentsController.getNextComments);

// This route is used to remove a comment
router.post('/:commentId/remove-comment', commentsController.removeComment);

// This route is used to mark a comment as read
router.post('/:commentId/mark-read', commentsController.markCommentAsRead);

// This route is used to like a comment
router.post('/:commentId/like', commentsController.like);

// This route is used to unlike a comment
router.post('/:commentId/unlike', commentsController.unlike);

// GET - Get number of posts
router.get('/count', commentsController.getCommentsCount);

export { router as commentRoutes};