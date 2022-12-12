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
     * Function to get all comments of a post
     * @param req 
     * @param res 
     * @param next 
     */
    async getAllComments(req: Request, res: Response, next: NextFunction){
        try {
            const { postId, storyId } = req.query;
            // Service function to get all comments
            const comments = await commentsService.getAllComments(postId, storyId);

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
     * Function to get first 5 comments on a post
     * @param req 
     * @param res 
     * @param next 
     */
    async getComments(req: Request, res: Response, next: NextFunction){
        try {
            const { postId, storyId } = req.query;
            // Service function to get top 5 comments
            const comments = await commentsService.getComments(postId, storyId);

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
        try {
            const { postId, commentId } = req.query;
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
        try {
            const { params: { commentId } } = req;
            const userId = req['userId'];
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
        try {
            const { params: { commentId } } = req;
            const userId = req['userId'];
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


    /**
     * This function is used to like a comment
     * @param req 
     * @param res 
     * @param next 
     */
    async like(req: Request, res: Response, next: NextFunction){
        try {
            const { params: { commentId } } = req;
            const userId = req['userId'];
            // Service function call
            const data = await commentsService.likeComment(userId, commentId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Comment Successfully Liked',
                comment: data.comment,
                user: data.user
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to unlike a comment
     * @param req 
     * @param res 
     * @param next 
     */
    async unlike(req: Request, res: Response, next: NextFunction){
        try {
            const { params: { commentId } } = req;
            const userId = req['userId'];

            // Call service functio to unlike
            const data = await commentsService.unlikeComment(userId, commentId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Comment Successfully Unliked',
                comment: data.comment,
                user: data.user
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to unlike a post
     * @param req 
     * @param res 
     * @param next 
     */
    async likedBy(req: Request, res: Response, next: NextFunction) {
        // Fetch postId from the request
        const { params: { postId } } = req;

        // Call Service function to unlike a post
        let likedBy: any = await commentsService.likedBy(postId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'List of users like the comment',
            likedBy: likedBy
        });
    }


    /**
     * Function to get the count of comments on a post
     * @param req 
     * @param res 
     * @param next 
     */
    async getCommentsCount(req: Request, res: Response, next: NextFunction){
        try {
            const { postId, period } = req.query;

            // Service function to get all comments
            const numComments = await commentsService.getCommentsCount(postId, period);

            // Status 200 response
            return res.status(200).json({
                message: 'Comments found!',
                numComments: numComments
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

}