import { Post } from '../models';
import { Response, Request, NextFunction } from "express";
import { PostService } from '../services';
import { sendErr } from '../utils/sendError';

const postService = new PostService();

export class PostController {

    /**
     * This function is responsible to add a post
     * @param { postData }
     */
    async add(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { post } = req.body;

        try {

            // Call servide function for adding the post
            const postData = await postService.addPost(post)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
                })

            // Send Status 200 response
            return res.status(200).json({
                message: 'Post Added Successfully',
                post: postData
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is responsible for editing a post
     * @param req 
     * @param res 
     * @param next 
     */
    async edit(req: Request, res: Response, next: NextFunction) {
        try {

            // Call service function to edit
            const updatedPost = postService.edit(req);
            return res.status(200).json({
                message: 'Post Edit Successful',
                post: updatedPost
            });
        } catch (error) {
            if (error == null) {
                sendErr(res, null, 'User not allowed to edit this post!', 403);
            }
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to retrieve a post
     * @param req 
     * @param res 
     * @param next 
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {

            const { postId } = req.params;

            // Call service function to get
            const post = await postService.get(postId);

            return res.status(200).json({
                message: 'Post Found!',
                post: post
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error', 500);
        }
    }


    /**
     * This function is responsible for removing a post
     * @param req 
     * @param res 
     * @param next 
     */
    async remove(req: Request, res: Response, next: NextFunction) {
        try {

            // Retrieving data from request 
            const { postId } = req.params;
            const userId: any = req['userId'];

            // Calling service function to remove post
            const postRemoved = postService.remove(userId, postId);

            // Returning status 200 response
            return res.status(200).json({
                message: 'Post removed successfully',
                postRemoved: postRemoved
            });

        } catch (error) {
            if (error == null) {
                return sendErr(res, null, 'User not allowed to remove this post!', 403)
            }
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the 5 recent posts present inside a group
     * @param { query: { groupId, lastPostId } } req 
     * @param res 
     * @param next 
     */
    async getPosts(req: Request, res: Response, next: NextFunction) {

        // Fetch groupId and lastPostId from request
        const { groupId, lastPostId } = req.query;

        try {

            // If groupId is not present, then return error
            if(!groupId){
                return sendErr(res, new Error('Please provide the groupId as the query parameter'), 'Please provide the groupId as the query paramater!', 400);
            }

            // Fetch the next 5 recent posts
            await postService.getPosts(groupId, lastPostId)
                .then((posts) => {

                    // If lastPostId is there then, send status 200 response
                    if(lastPostId)
                        return res.status(200).json({
                            message: `The next ${posts.length} most recent posts!`,
                            posts: posts
                        });
                    
                    // If lastPostId is not there then, send status 200 response
                    else
                        return res.status(200).json({
                            message: `The first ${posts.length} most recent posts!`,
                            posts: posts
                        });
                })
                .catch((err) => {

                    // If there's an error send bad request
                    return sendErr(res, new Error(err), 'Unable to fetch the posts, kindly check the stack trace for error', 400)
                })

        } catch (err) {
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }


}