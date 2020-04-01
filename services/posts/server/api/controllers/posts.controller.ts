import { Post } from '../models';
import { Response, Request, NextFunction } from "express";
import { PostService } from '../services';
import { sendErr } from '../utils/sendError';

const postService = new PostService();

export class PostController{

    /**
     * This function is responsible to add a post
     * @param { postData }
     */
    async add(req: Request, res: Response, next: NextFunction){
        const { postData } = req.body;

        try {
            // Call servide function for add
            const post = await postService.addPost(postData);

            return res.status(200).json({
                message: 'Post Added Successfully',
                post: post
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
  async edit(req: Request, res: Response, next: NextFunction){
      try {

        // Call service function to edit
        const updatedPost = postService.edit(req);
        res.status(200).json({
            message: 'Post Edit Successful',
            post: updatedPost
        });
      } catch (error) {
          if (error == null){
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
  async get(req: Request, res: Response, next: NextFunction){
      try {
          
        const { postId } = req.params;

        // Call service function to get
        const post = await postService.get(postId);

        res.status(200).json({
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
  async remove(req: Request, res: Response, next: NextFunction){
        try {
            
            // Retrieving data from request 
            const { postId } = req.params;
            const userId:any = req['userId'];

            // Calling service function to remove post
            const postRemoved = postService.remove(userId, postId);

            // Returning status 200 response
            res.status(200).json({
                message: 'Post removed successfully',
                postRemoved: postRemoved
            });

        } catch (error) {
            if (error == null){
                return sendErr(res, null, 'User not allowed to remove this post!', 403)
            }
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
  }


}