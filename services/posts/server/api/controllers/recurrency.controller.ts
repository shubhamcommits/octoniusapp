import { Response, Request, NextFunction } from "express";
import { sendErr } from "../utils/sendError";
import { Post } from "../models";
import { DateTime } from "luxon";
import { Readable } from "stream";
import { PostService } from "../services";

const postService = new PostService();

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

    async postRecurencyCreation(/*postId?: string*/) {
        try {
            const today = DateTime.now();
            console.log("Reccurent job.", today);
            // Build the query
            const query: any[] = [
                { is_recurrent: true },
                {
                    $or: [
                        {
                            "recurrent.end_date": {
                                $gte: today,
                            },
                        },
                        {
                            "recurrent.end_date": {
                                $exists: false,
                            },
                        },
                        { "recurrent.end_date": null },
                    ],
                },
                {
                    $or: [
                        {
                            $and: [
                                {
                                    "recurrent.frequency": {
                                        $in: ["daily", "weekly"],
                                    },
                                },
                                {
                                    "recurrent.days_of_week": {
                                        $eq: today.weekday,
                                    },
                                },
                            ],
                        },
                        {
                            $and: [
                                {
                                    "recurrent.frequency": {
                                        $eq: "monthly",
                                    },
                                },
                                {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    {
                                                        $dayOfMonth:
                                                            "$recurrent.recurrency_on",
                                                    },
                                                    {
                                                        $dayOfMonth: today,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                        {
                            $and: [
                                {
                                    "recurrent.frequency": {
                                        $eq: "yearly",
                                    },
                                },
                                {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    {
                                                        $dayOfMonth:
                                                            "$recurrent.recurrency_on",
                                                    },
                                                    {
                                                        $dayOfMonth: today,
                                                    },
                                                ],
                                            },
                                            {
                                                $eq: [
                                                    {
                                                        $month: "$recurrent.recurrency_on",
                                                    },
                                                    { $month: today },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                        {
                            $and: [
                                {
                                    "recurrent.frequency": {
                                        $eq: "custom",
                                    },
                                },
                                {
                                    $expr: {
                                        $in: [
                                            today.toISODate(), // Convert today to ISO date string
                                            {
                                                $ifNull: [
                                                    "$recurrent.recurrency_on",
                                                    [],
                                                ],
                                            }, // Si es null, usar un array vacío
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ];

            // Add postId condition if provided
            // if (!!postId) {
            //     query.push({ _id: postId });
            // }

            let postsStream = Readable.from(
                await Post.find({ $and: query }).lean()
            );

            await postsStream.on("data", async (post: any) => {
                const tmpPost = await Post.findById(
                    post.recurrent._parent_post
                ).lean();
                console.log("tmpPost: ", tmpPost?._id);
                if (!tmpPost) {
                    console.log("post: ", post._id);
                    this.clonePost(
                        post,
                        post._posted_by._id || post._posted_by,
                        null
                    );
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async executeRecurrency(post, userId) {
        const tmpPost = await Post.findById(post.recurrent._parent_post).lean();

        if (!tmpPost) {
            const today = DateTime.now();
            // const tomorrow = today.plus({ days: 1 });
            let dueDate = DateTime.now();
            dueDate.weekday;
            switch (post.recurrent.frequency) {
                case "daily":
                case "weekly":
                    if (
                        // (post.recurrent.days_of_week.includes(today.weekday) ||
                        //     )
                        // &&
                        DateTime.fromIso(post.recurrent.end_date) >= today ||
                        !post.recurrent.end_date
                    ) {
                        if (post.recurrent.frequency === "daily") {
                            dueDate = dueDate.plus({ days: 1 });
                        } else if (post.recurrent.frequency === "weekly") {
                            dueDate = dueDate.plus({ weeks: 1 });
                        }
                        this.clonePost(post, userId, dueDate);
                    }
                    break;
                case "monthly":
                    if (
                        today.day ===
                        DateTime.fromIso(post.recurrent.recurrency_on).day
                    ) {
                        dueDate = dueDate.plus({ months: 1 });
                        this.clonePost(post, userId, dueDate);
                    }
                    break;
                case "yearly":
                    if (
                        today.day ===
                            DateTime.fromIso(post.recurrent.recurrency_on)
                                .day &&
                        today.month ===
                            DateTime.fromIso(post.recurrent.recurrency_on).month
                    ) {
                        dueDate = dueDate.plus({ years: 1 });
                        this.clonePost(post, userId, dueDate);
                    }
                    break;
                case "custom":
                    if (
                        post.recurrent.recurrency_on.includes(today.toISODate())
                    ) {
                        this.clonePost(post, userId, today);
                    }
                    break;
            }
        }
    }

    async clonePost(post, userId, dueDate?) {
        // Crear una copia completa del objeto post
        const postCopy = JSON.parse(JSON.stringify(post));

        postCopy.recurrent._parent_post = post._id;
        postCopy.task.status = "to do";
        postCopy.task.due_to = !!dueDate ? dueDate : DateTime.now();
        postCopy.created_date = DateTime.now();

        // Create new post
        await postService.addPost(JSON.stringify(postCopy), userId);

        console.log("Post Recurrency Created");
    }
}
