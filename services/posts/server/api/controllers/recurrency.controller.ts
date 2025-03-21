import { Response, Request, NextFunction } from "express";
import { sendErr } from "../utils/sendError";
import { Post } from "../models";
import { DateTime } from "luxon";
import { Readable } from "stream";
import { PostService } from "../services";
import { ensureDateTime } from "../utils";

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
            // recurrent._parent_post = postId;
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

            const posts = await Post.find({ $and: query }).lean();

            posts.forEach(async (post) => {
                // console.log("postStream._id: ", post._id);
                // console.log("postStream.duedate: ", post.task.due_to);
                // console.log(
                //     "postStream.recurrent._parent_post: ",
                //     post.recurrent._parent_post
                // );
                // console.log(
                //     "postStream.recurrent.frequency: ",
                //     post.recurrent.frequency
                // );
                // console.log(
                //     "postStream.recurrent.recurrency_on: ",
                //     post.recurrent.recurrency_on
                // );
                // console.log(
                //     "postStream.recurrent.end_date: ",
                //     post.recurrent.end_date
                // );
                // console.log(
                //     "postStream.recurrent.days_of_week: ",
                //     post.recurrent.days_of_week
                // );
                // console.log(
                //     "postStream.recurrent.specific_days: ",
                //     post.recurrent.specific_days
                // );
                const clonedPosts = await Post.find({
                    "recurrent._parent_post": post._id,
                }).lean();

                if (!clonedPosts || clonedPosts.length === 0) {
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
        const clonedPosts = await Post.find({
            "recurrent._parent_post": post._id,
        }).lean();
        console.log("tmpPost: ", clonedPosts);

        if (!clonedPosts || clonedPosts.length === 0) {
            const originalDueDate = ensureDateTime(post.task.due_to); // Obtener la fecha de vencimiento original
            let dueDate;
            // console.log("post.task.due_to: ", post.task.due_to);
            // console.log("originalDueDate: ", originalDueDate);
            // console.log("originalDueDate.weekday: ", originalDueDate.weekday);
            switch (post.recurrent.frequency) {
                case "daily":
                    if (
                        post.recurrent.days_of_week.includes(
                            originalDueDate.weekday
                        )
                    ) {
                        dueDate = originalDueDate.plus({ days: 1 });
                    } else {
                        console.log(
                            "Original due date is not in the specified days of the week."
                        );
                        return;
                    }
                    break;

                case "weekly":
                    if (
                        post.recurrent.days_of_week.length === 1 &&
                        post.recurrent.days_of_week[0] ===
                            originalDueDate.weekday
                    ) {
                        dueDate = originalDueDate.plus({ weeks: 1 });
                    } else {
                        console.log(
                            "Original due date does not match the specified day of the week for weekly recurrence."
                        );
                        return;
                    }
                    break;

                case "monthly":
                    const recurrencyDay = ensureDateTime(
                        post.recurrent.recurrency_on
                    ); // Usar recurrency_on
                    dueDate = recurrencyDay.plus({ months: 1 }); // Calcular el próximo mes
                    break;

                case "yearly":
                    const recurrencyDate = ensureDateTime(
                        post.recurrent.recurrency_on
                    ); // Usar recurrency_on
                    dueDate = recurrencyDate.plus({ years: 1 }); // Calcular el próximo año
                    break;

                case "custom":
                    const specificDays = post.recurrent.specific_days
                        .map((date) => ensureDateTime(date))
                        .filter((date) => date > originalDueDate) // Filtrar fechas posteriores a originalDueDate
                        .sort((a, b) => a.toMillis() - b.toMillis()); // Ordenar por fecha más cercana
                    if (specificDays.length > 0) {
                        dueDate = specificDays[0]; // Tomar la próxima fecha
                    } else {
                        console.log(
                            "No future dates found in the specified custom recurrence days."
                        );
                        return;
                    }
                    break;

                default:
                    console.log(
                        "Unknown recurrence frequency:",
                        post.recurrent.frequency
                    );
                    return;
            }
            // console.log("dueDate: ", dueDate);
            // Validar si el dueDate está dentro del rango permitido o si no hay fecha de fin
            if (
                !post.recurrent.end_date ||
                ensureDateTime(post.recurrent.end_date) >= dueDate
            ) {
                this.clonePost(post, userId, dueDate);
            } else {
                console.log("Recurrence has ended or due date is invalid.");
            }
        }
    }

    async clonePost(post, userId, dueDate?) {
        // Crear una copia completa del objeto post
        const postCopy = JSON.parse(JSON.stringify(post));
        delete postCopy._id;
        postCopy.recurrent._parent_post = post._id;
        postCopy.task.status = "to do";
        postCopy.task.due_to = !!dueDate ? dueDate : DateTime.now();
        postCopy.created_date = DateTime.now();

        // Create new post
        await postService.addPost(JSON.stringify(postCopy), userId);

        console.log("Post Recurrency Created");
    }
}
