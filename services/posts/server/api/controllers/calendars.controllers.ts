import { Response, Request, NextFunction } from "express";
import { CalendarService } from '../services';
import { sendErr } from '../utils/sendError';

/**
 * Calendar Service Class Object
 */
let calendarService = new CalendarService()

export class CalendarController {

    /**
     * This function is used to retrieve a post
     * @param req 
     * @param res 
     * @param next 
     */
    async getCalendarPosts(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch Data from request
            const { year, month, groupId, userId } = req.query

            // Call service function to get
            let posts: any = calendarService.getCalendarPosts(year, month, groupId, userId) || [];

            // Send Status 200 response
            return res.status(200).json({
                message: 'Calendar posts found!',
                posts: posts
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error', 500);
        }
    }

}