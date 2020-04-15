import { Post } from '../models';
import { Response, Request, NextFunction } from "express";
import { PostService, TagsService } from '../services';
import { sendErr } from '../utils/sendError';

const postService = new PostService();

const tagsService = new TagsService()

export class PostController {

    /**
     * This function is responsible to add a post
     * @param { post } req
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
                message: 'Post Added Successfully!',
                post: postData
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is responsible for editing a post
     * @param { post } req
     * @param res 
     * @param next 
     */
    async edit(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { body: { post }, params: { postId } } = req;

        try {

            // Call service function to edit
            const updatedPost = await postService.editPost(post, postId)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
                })

            // Send Status 200 response
            return res.status(200).json({
                message: 'Post Edited Successfully!',
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
        var { groupId, lastPostId, type } = req.query;

        // If type is not defined, then fetch all the posts by default
        if (!type || type == '' || type === "") {
            type = 'all'
        }

        try {

            // If groupId is not present, then return error
            if (!groupId) {
                return sendErr(res, new Error('Please provide the groupId as the query parameter'), 'Please provide the groupId as the query paramater!', 400);
            }

            // Fetch the next 5 recent posts
            await postService.getPosts(groupId, type, lastPostId)
                .then((posts) => {

                    // If lastPostId is there then, send status 200 response
                    if (lastPostId)
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


    /**
     * This function is used to like a post
     * @param req 
     * @param res 
     * @param next 
     */
    async like(req: Request, res: Response, next: NextFunction) {
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
    async unlike(req: Request, res: Response, next: NextFunction) {
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
    async getThisMonthTasks(req: Request, res: Response, next: NextFunction) {
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
    async getThisWeekTasks(req: Request, res: Response, next: NextFunction) {
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
    async getNextTasks(req: Request, res: Response, next: NextFunction) {
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
    async getThisMonthEvents(req: Request, res: Response, next: NextFunction) {
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
    async getThisWeekEvents(req: Request, res: Response, next: NextFunction) {
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
    async getNextEvents(req: Request, res: Response, next: NextFunction) {
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

    /**
     * This function is responsible for changing the task assignee
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskAssignee(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { assigneeId } } = req;

        try {

            // Call Service function to change the assignee
            const post = await postService.changeTaskAssignee(postId, assigneeId)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                })

            // Send status 200 response
            return res.status(200).json({
                message: 'Task assignee updated!',
                post: post
            });
        } catch (err) {
            return sendErr(res, err);
        }
    }

    /**
     * This function is responsible for changing the task due date
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskDueDate(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { date_due_to } } = req;

        try {

            // Call Service function to change the assignee
            const post = await postService.changeTaskDueDate(postId, date_due_to)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                })

            // Send status 200 response
            return res.status(200).json({
                message: 'Task due date updated!',
                post: post
            });
        } catch (err) {
            return sendErr(res, err);
        }
    }

    /**
     * This function is responsible for changing the task status
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskStatus(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { status } } = req;

        try {

            // Call Service function to change the assignee
            const post = await postService.changeTaskStatus(postId, status)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                })

            // Send status 200 response
            return res.status(200).json({
                message: 'Task status updated!',
                post: post
            });
        } catch (err) {
            return sendErr(res, err);
        }
    }

    /**
     * This function is responsible for fetching the tags
     * @param req 
     * @param res 
     * @param next 
     */
    async getTags(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        let groupId: any = req.query.groupId;
        let tag: any = req.query.tag;

        console.log(groupId, tag)

        try {

            // Call Service function to fetch the tags
            // const tags = await tagsService.getTagsSearchResults(groupId, tag)
            //     .catch((err) => {
            //         return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            //     })

            // Send status 200 response
            return res.status(200).json({
                message: 'Task status updated!',
                // tags: tags
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }
}