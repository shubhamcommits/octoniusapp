import express from 'express';
import { CommentsController } from '../controllers';

const router = express.Router();
const commentsController = new CommentsController();

// This route is used to add a new comment
router.post('/new-comment', commentsController.addComment);

// This route is used to edit a comment
router.post('/edit-comment', commentsController.editComment);

// This route is used to retrieve a comment
router.get('/get-comment', commentsController.getComment);

// This route is used to get first 5 comments
router.get('/comments', commentsController.getComments);

// This route is used to get next 5 comments
router.get('/next-comments', commentsController.getNextComments);

// This route is used to remove a comment
router.post('/remove-comment', commentsController.removeComment);

// This route is used to mark a comment as read
router.post('/mark-read', commentsController.markCommentAsRead);

// This route is used to like a comment
router.post('/like', commentsController.like);

// This route is used to unlike a comment
router.post('/unlike', commentsController.unlike);

export { router as commentRoutes};