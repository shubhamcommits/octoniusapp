import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';
import { PostsService } from "../services";

// Post Service Object
let postsService = new PostsService()

/*  ===================
 *  -- POSTS METHODS --
 *  ===================
 * */
export class PostsControllers {

    async getAllUserTasks(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch today's task
            const tasks: any = await postsService.getAllUserTasks(userId);

            // Send status 200 response
            return res.status(200).json({
                message: 'All User´s Taks!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getTodayTasks(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch today's task
            const tasks: any = await postsService.getTodayTasks(userId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Today\'s tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getOverdueTasks(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch overdue task
            const tasks: any = await postsService.getOverdueTasks(userId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Overdue tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getThisWeekTasks(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch this week's task
            const tasks: any = await postsService.getThisWeekTasks(userId);

            // Send status 200 response
            return res.status(200).json({
                message: 'This weeks\' tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }


    async getNextWeekTasks(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch this week's task
            const tasks: any = await postsService.getNextWeekTasks(userId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Next weeks\' tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getFutureTasks(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch this week's task
            const tasks: any = await postsService.getFutureTasks(userId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Future tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getTodayEvents(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch today events
            const events: any = await postsService.getTodayEvents(userId)

            // Send status 200 response
            return res.status(200).json({
                message: 'Today\'s events found!',
                events: events
            })

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getThisWeekEvents(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch today events
            const events: any = await postsService.getThisWeekEvents(userId)

            // Send status 200 response
            return res.status(200).json({
                message: 'This week\'s events found!',
                events: events
            })

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getGlobalFeed(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the userId from the request query
            let userId: any = req.query.userId

            // If userId is not there in query, then use the current loggedIn userId
            if(!userId || userId == "undefined"){
                userId = req['userId']
            }

            // If userId is not found
            if(!userId){
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch global feed
            const feed: any = await postsService.getGlobalFeed(userId)

            // Send status 200 response
            return res.status(200).json({
                message: 'Global feed is found!',
                events: feed.events,
                tasks: feed.tasks,
                posts: feed.posts
            })

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * Fetches all the overdue tasks for a specific group and user
     * 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async getWorkloadCardOverdueTasks(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch the userId from the request query
            const { userId, groupId } = req.query;

            // If userId is not found
            if(!userId) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch overdue task
            const tasks: any = await postsService.getWorkloadCardOverdueTasks(userId, groupId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Overdue tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * Fetches all the overdue tasks for a specific group and user
     * 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async getWorkloadCardOverduePortfolioTasks(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch the userId from the request query
            const { userId, portfolioId } = req.query;

            // If userId is not found
            if(!userId || !portfolioId){
                return sendError(res, new Error('Unable to find the user and portfolioId, either userId and portfolioId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch overdue task
            const tasks: any = await postsService.getWorkloadCardOverduePortfolioTasks(userId.toString(), portfolioId.toString());

            // Send status 200 response
            return res.status(200).json({
                message: 'Overdue tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}