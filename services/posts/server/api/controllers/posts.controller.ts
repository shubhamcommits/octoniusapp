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


  /**
   * This function is used to like a post
   * @param req 
   * @param res 
   * @param next 
   */
  async like(req: Request, res: Response, next: NextFunction){
    try {
        const { params: { postId } } = req;
        const userId = req['userId'];

        // Call Service function to like a post
        const data = await postService.like(userId, postId);

        // Send status 200 response
        return res.status(200).json({
            message: 'Post Successfully Liked',
            post: data.post,
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
  async unlike(req: Request, res: Response, next: NextFunction){
      try {
        const { params: { postId } } = req;
        const userId = req['userId'];

        // Call Service function to unlike a post
        const data = await postService.unlike(userId, postId);

        // Send status 200 response
        return res.status(200).json({
            message: 'Post Successfully Unliked',
            post: data.post,
            user: data.user
        });
      } catch (error) {
        return sendErr(res, new Error(error), 'Internal Server Error!', 500);
      }
  }


  /**
   * Anish 02/04 edits start
   */


   /**
    * This function is used to retrieve all of this month's tasks
    * @param req 
    * @param res 
    * @param next 
    */
   async getThisMonthTasks(req: Request, res: Response, next: NextFunction){
       try {
           const userId = req['userId'];

            // Call service function to retrieve this months task
            const data = await postService.getThisMonthTasks(userId);

            // Send status 200 response
            return res.status(200).json(data);
       } catch (error) {
           return sendErr(res, new Error(error), 'Internal Server Error!', 500);
       }
   }


   /**
    * This function is used to get first 10 tasks for this week
    * @param req 
    * @param res 
    * @param next 
    */
   async getThisWeekTasks(req: Request, res: Response, next: NextFunction){
    try {
        const userId = req['userId'];

         // Call service function to retrieve this week's task
         const data = await postService.getThisWeekTasks(userId);

         // Send status 200 response
         return res.status(200).json(data);
    } catch (error) {
        return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get next 5 tasks for this week
     * @param req 
     * @param res 
     * @param next 
     */
    async getNextTasks(req: Request, res: Response, next: NextFunction){
        try {
            const userId = req['userId'];
            const { lastTaskId } = req.query;

            // Service function to get next 5 tasks for this week
            const data = await postService.getNextTasks(userId, lastTaskId);

            // Status 200 response status
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get this month's events
     * @param req 
     * @param res 
     * @param next 
     */
    async getThisMonthEvents(req: Request, res: Response, next: NextFunction){
        try {
            const userId = req['userId'];

            // Call service function to get events
            const data = await postService.getThisMonthsEvents(userId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get first 10 events of this week
     * @param req 
     * @param res 
     * @param next 
     */
    async getThisWeekEvents(req: Request, res: Response, next: NextFunction){
        try {
            const userId = req['userId'];

            // Call service function to get events
            const data = await postService.getThisWeekEvents(userId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get next 5 events for this week
     * @param req 
     * @param res 
     * @param next 
     */
    async getNextEvents(req: Request, res: Response, next: NextFunction){
        try {
            const userId = req['userId'];
            const { lastEventIId } = req.query;

            // Call service function to get events
            const data = await postService.getNextEvents(userId, lastEventIId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }
}