import { Response, Request, NextFunction } from "express";
import { CalendarService } from "../services";
import { sendErr } from "../utils/sendError";
import { Post } from "../models";

/**
 * Calendar Service Class Object
 */
let calendarService = new CalendarService();

export class RecurrencyController {
    /**
     * This function is used to retrieve a post
     * @param req
     * @param res
     * @param next
     */
    async saveRecurrency(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch Data from request
            const {
                params: { postId },
            } = req;

            let recurrent = req.body.recurrent;
            recurrent._parent_post = postId;
            const post = await Post.findByIdAndUpdate(
                { _id: postId },
                {
                    $set: {
                        is_recurrent: req.body.is_recurrent,
                        recurrent: recurrent,
                    },
                },
                { new: true }
            )
                .populate({
                    path: "recurrent._parent_post",
                    select: "_id title",
                })
                .lean();

            // Send Status 200 response
            return res.status(200).json({
                message: "Posts recurrency saved!",
                post: post,
            });
        } catch (error) {
            return sendErr(res, new Error(error), "Internal Server Error", 500);
        }
    }
}
