import { Request, Response, NextFunction } from 'express';
import { sendErr } from '../utils/sendError';
import { CommentsService } from '../services';

const commentsService = new CommentsService();


export class CommentsController{


    /**
     * Function to add a new comment
     * @param req 
     * @param res 
     * @param next 
     */
    async addComment(req: Request, res: Response, next: NextFunction){
        
        try {
            // Calling service function to add comment
            const comment = await commentsService.addComment(req);

            // Status 200 response
            return res.status(200).json({
                message: 'Comment Added',
                comment: comment
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * Function to edit a comment
     * @param req 
     * @param res 
     * @param next 
     */
    async editComment(req: Request, res: Response, next: NextFunction){
        try {
            // Call service function to edit comment
            const updatedComment = await commentsService.editComment(req);

            // Send status 200 response
            return res.status(200).json({
                message: 'Comment Updated Successfully!',
                comment: updatedComment
            });
        } catch (error) {
            if (error == null){
                return sendErr(res, null, 'User not allowed to edit this comment!', 403);
            }
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * Function to get a comment
     * @param req 
     * @param res 
     * @param next 
     */
    async getComment(req: Request, res: Response, next: NextFunction){
        const { commentId } = req.params;
        try {
            
            // Service function to get comment
            const comment = await commentsService.getComment(commentId);

            // Status 200 response
            return res.status(200).json({
                message: 'Comment found!',
                comment: comment
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * Function to get first 5 comments on a post
     * @param req 
     * @param res 
     * @param next 
     */
    async getComments(req: Request, res: Response, next: NextFunction){
        const { postId } = req.params;
        try {
            // Service function to get all comments
            const comments = await commentsService.getComments(postId);

            // Status 200 response
            return res.status(200).json({
                message: 'Comments found!',
                comments: comments
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * Function to get next 5 comments on a post
     * @param req 
     * @param res 
     * @param next 
     */
    async getNextComments(req: Request, res: Response, next: NextFunction){
        const { postId, commentId } = req.params;
        try {

            // Service function to get next comments
            const comments = await commentsService.getNextComments(postId, commentId);

            // Status 200 response
            return res.status(200).json({
                message: `Next ${comments.length} comments!`,
                comments: comments
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * Function to remove comment from a post
     * @param req 
     * @param res 
     * @param next 
     */
    async removeComment(req: Request, res: Response, next: NextFunction){
        const { params: { commentId } } = req;
        const userId = req['userId'];
        try {
            // Service function to remove comment
            const commentRemoved = await commentsService.removeComment(userId, commentId);

            // Status 200 response
            return res.status(200).json({
                message: 'Comment Deleted!',
                commentRemoved: commentRemoved
            });
        } catch (error) {
            if (error == null){
                return sendErr(res, null, 'User not allowed to delete this comment!', 403);
            }
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * Function to mark a comment as read
     * @param req 
     * @param res 
     * @param next 
     */
    async markCommentAsRead(req: Request, res: Response, next: NextFunction){
        const userId = req['userId'];
        const { commentId } = req.params;

        try {
            // Service function to mark comment as read
            const message = await commentsService.markCommentAsRead(userId, commentId);

            // Status 200 response
            return res.status(200).json({
                message: message
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

}