import { Portfolio, Post, User } from "../models";
import { DateTime } from 'luxon';
import { ObjectID } from "mongodb";

export class PostsService {

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar';
    postFields: any = 'title _group _assigned_to permissions _posted_by _created_by approval_flow_launched task.status task._column task.due_to task.estimation task?._parent_task'

    /**
     * This function is responsible for fetching todays task for the user
     * @param userId 
     */
    async getAllUserTasks(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        // Fetch users task for today
        const tasks = await Post.find({
                $and: [
                    // { $or: [
                    //         { '_assigned_to': userId },
                    //         { '_group': user._private_group }
                    //     ]
                    // },
                    { _assigned_to: userId },
                    { type: 'task' },
                    { 'task.is_template': { $ne: true }},
                    {
                        $or: [
                            { 
                                $and: [
                                    { _group: null },
                                    { 'task.isNorthStar': true },
                                    { 'task._parent_task': null }
                                ]
                            },
                            { _group: { $ne: null }}
                        ]
                    },
                    // {
                    //     $or: [
                    //         { 'task.status': 'to do' },
                    //         { 'task.status': 'in progress' },
                    //         { 'task.status': 'done' }
                    //     ]
                    // }
                ]
            })
            .sort('-task.due_to')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return Tasks
        return tasks
    }

    async getAllGroupTasks(userId: string) {
        // Get the current time in UTC
        const now = DateTime.now().endOf("day");
        // Define time ranges using Luxon
        const today = now.toUTC();
        const tomorrow = now.plus({ days: 1 }).endOf("day").toUTC();
        const endOfWeek = now.endOf("week").toUTC();
        const endOfNextWeek = now.plus({ weeks: 1 }).endOf("week").toUTC();

        const user = await User.findById(userId).select('_private_group');
        
        const tasks = await Post.aggregate([
            {
                $match: {
                    $and: [
                        { $or: [
                                { '_assigned_to': new ObjectID(userId) },
                                { '_group': new ObjectID(user._private_group) }
                            ]
                        },
                        { 'task.is_template': { $ne: true }},
                        { 'type': 'task' },
                        { $or: [
                                { 
                                    $and: [
                                        { '_group': null },
                                        { 'task.isNorthStar': true },
                                        { 'task._parent_task': null }
                                    ]
                                },
                                { '_group': { $ne: null }}
                            ]
                        },
                        {
                            $or: [
                                { 'task.status': 'to do' },
                                { 'task.status': 'in progress' }
                            ]
                        }
                    ]    
                }
            },
            {
                $lookup: {
                  from: 'groups',
                  localField: '_group',
                  foreignField: '_id',
                  as: '_group',
                },
            },
            {
                "$unwind": "$_group"
            },
            {
                $group: {
                    _id: null,
                    overdue_today: {
                        $push: {
                            $cond: [
                                { $and: [{ $lte: ["$task.due_to", today] }, { $ne: ["$task.due_to", null] }] },
                                "$$ROOT",
                                null
                            ]
                        }
                    },
                    tomorrow: {
                        $push: {
                            $cond: [
                                { $and: [{ $gt: ["$task.due_to", today] }, { $lt: ["$task.due_to", tomorrow] }] },
                                "$$ROOT",
                                null
                            ]
                        }
                    },
                    this_week: {
                        $push: {
                            $cond: [
                                { $and: [{ $gte: ["$task.due_to", tomorrow] }, { $lte: ["$task.due_to", endOfWeek] }] },
                                "$$ROOT",
                                null
                            ]
                        }
                    },
                    next_week: {
                        $push: {
                            $cond: [
                                { $and: [{ $gt: ["$task.due_to", endOfWeek] }, { $lte: ["$task.due_to", endOfNextWeek] }] },
                                "$$ROOT",
                                null
                            ]
                        }
                    },
                    future: {
                        $push: {
                            $cond: [
                                { $or: [{ $gt: ["$task.due_to", endOfNextWeek] }, { $eq: ["$task.due_to", null] }] },
                                "$$ROOT",
                                null
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    overdue_today: { $filter: { input: "$overdue_today", as: "task", cond: { $ne: ["$$task", null] } } },
                    tomorrow: { $filter: { input: "$tomorrow", as: "task", cond: { $ne: ["$$task", null] } } },
                    this_week: { $filter: { input: "$this_week", as: "task", cond: { $ne: ["$$task", null] } } },
                    next_week: { $filter: { input: "$next_week", as: "task", cond: { $ne: ["$$task", null] } } },
                    future: { $filter: { input: "$future", as: "task", cond: { $ne: ["$$task", null] } } }
                }
            }
        ]);
        
        return tasks.length > 0 ? tasks[0] : { overdue_today: [], tomorrow: [], this_week: [], next_week: [], future: [] }
    }

    /**
     * This function is responsible for fetching todays task for the user
     * @param userId 
     */
    async getTodayTasks(userId: string) {

        const today = DateTime.now();

        const user = await User.findById(userId).select('_private_group');

        // Fetch users task for today
        const tasks = await Post.find({
                $and: [
                    { $or: [
                            { '_assigned_to': userId },
                            { '_group': user._private_group }
                        ]
                    },
                    // { 'task.due_to': { $gte: startOfDay, $lte: endOfDay }},
                    { 'task.due_to': { $eq: today.toJSDate() }},
                    { 'task.is_template': { $ne: true }},
                    { $or: [
                            { 
                                $and: [
                                    { '_group': null },
                                    { 'task.isNorthStar': true },
                                    { 'task._parent_task': null }
                                ]
                            },
                            { '_group': { $ne: null }}
                        ]
                    },
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' },
                            { 'task.status': 'done' }
                        ]
                    }
                ]
            })
            .sort('-task.due_to')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return Tasks
        return tasks
    }

    /**
     * This function is responsible for fetching overdue tasks
     * @param userId 
     */
    async getOverdueTasks(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        // Generate the actual time
        const today = DateTime.now();

        // Fetch the tasks posts
        const tasks = await Post.find({
                $and: [
                    { $or: [
                            { '_assigned_to': userId },
                            { '_group': user._private_group }
                        ]
                    },
                    { 'task.due_to': { $lt: today.toJSDate() }},
                    { 'task.is_template': { $ne: true }},
                    { $or: [
                            { 
                                $and: [
                                    { '_group': null },
                                    { 'task.isNorthStar': true },
                                    { 'task._parent_task': null }
                                ]
                            },
                            { '_group': { $ne: null }}
                        ]
                    },
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' }
                        ]
                    }
                ]
            })
            .sort('-task.due_to')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return tasks
        return tasks
    }

    /**
     * This function is responsible for fetching tasks due this week
     * @param userId 
     */
    async getThisWeekTasks(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        // Generate the today
        const tomorrow = DateTime.now().plus({ days: 1 });

        // Generate the date for the end of the week
        const endOfWeek = DateTime.now().plus({ weeks: 1 }).endOf('week');

        // Fetch the tasks posts
        const tasks = await Post.find({
                $and: [
                    { $or: [
                            { '_assigned_to': userId },
                            { '_group': user._private_group }
                        ]
                    },
                    { 'task.due_to': { $gte: tomorrow.toJSDate(), $lte: endOfWeek.toJSDate() }},
                    { 'task.is_template': { $ne: true }},
                    { $or: [
                            { 
                                $and: [
                                    { '_group': null },
                                    { 'task.isNorthStar': true },
                                    { 'task._parent_task': null }
                                ]
                            },
                            { '_group': { $ne: null }}
                        ]
                    },
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' },
                            { 'task.status': 'done' }
                        ]
                    }
                ]
            })
            .sort('-task.due_to')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return tasks
        return tasks
    }

    /**
     * This function is responsible for fetching tasks due in the next week
     * @param userId 
     */
    async getNextWeekTasks(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        // Generate the date for the end of the week
        const endOfWeek = DateTime.now().endOf('week');

        // Generate the date for the end of the next week
        const endOfNextWeek = DateTime.now().plus({ weeks: 1 }).endOf('week');

        // Fetch the tasks posts
        const tasks = await Post.find({
                $and: [
                    { $or: [
                            { '_assigned_to': userId },
                            { '_group': user._private_group }
                        ]
                    },
                    {'task.due_to': { $gt: endOfWeek.toJSDate(), $lte: endOfNextWeek.toJSDate() }},
                    { 'task.is_template': { $ne: true }},
                    { $or: [
                            { 
                                $and: [
                                    { '_group': null },
                                    { 'task.isNorthStar': true },
                                    { 'task._parent_task': null }
                                ]
                            },
                            { '_group': { $ne: null }}
                        ]
                    },
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' },
                            { 'task.status': 'done' }
                        ]
                    }
                ]
            })
            .sort('-task.due_to')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return tasks
        return tasks
    }

    /**
     * This function is responsible for fetching tasks without due date
     * @param userId 
     */
    async getFutureTasks(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        // Generate the +14days from today time
        const todayPlus14Days = DateTime.now().plus({ days: 14 })

        // Fetch the tasks posts
        const tasks = await Post.find({
                $and:[
                    { 'task.is_template': { $ne: true }},
                    { 
                        $or: [
                            { '_assigned_to': userId },
                            { '_group': user._private_group }
                        ]
                    },
                    {
                        $or: [
                            { 'task.due_to': { $gte: todayPlus14Days.toJSDate() }},
                            { 'task.due_to': null }
                        ]
                        
                    },
                    { $or: [
                            { 
                                $and: [
                                    { '_group': null },
                                    { 'task.isNorthStar': true },
                                    { 'task._parent_task': null }
                                ]
                            },
                            { '_group': { $ne: null }}
                        ]
                    },
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' }
                        ]
                    }
                ]
            })
            .sort('-task.due_to')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Filter the tasks array
        tasks.filter((task)=> {
            return task['_group'] != null
        })

        // Return tasks
        return tasks
    }

    /**
     * This function is responsible for fetching todays event for the user
     * @param userId 
     */
    async getTodayEvents(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        const today = DateTime.now();

        // Find the user's today agenda events
        const events = await Post.find({
                // Find events due to today
                'type': 'event',
                $or: [
                    { '_assigned_to': userId },
                    // { '_assigned_to': 'all' }
                    { '_group': user._private_group }
                ],
                // 'event.due_to': { $gte: startOfDay, $lte: endOfDay }
                'event.due_to': { $eq: today.toJSDate() }

            })
            .sort('event.due_to')
            .populate('_posted_by', this.userFields)
            .populate('_group', this.groupFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)

        // Return Events
        return events;
    }

    /**
     * This function is responsible for fetching events due this week
     * @param userId 
     */
    async getThisWeekEvents(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        // Generate the actual time
        const todayForEvent = DateTime.now();
        // Generate the +24h time
        const todayPlus7Days = DateTime.now().plus({ days: 7 });

        // Find the user's today agenda events
        const events = await Post.find({
                // Find events due to this week
                'type': 'event',
                $or: [
                    { '_assigned_to': userId },
                    // { '_assigned_to': 'all' }
                    { '_group': user._private_group }
                ],
                'event.due_to': { $gte: todayForEvent.toJSDate(), $lte: todayPlus7Days.toJSDate() }
            })
            .sort('event.due_to')
            .populate('_posted_by', this.userFields)
            .populate('_group', this.groupFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)

        // Return Events
        return events;
    }

    async getRecentPosts(userId: string) {

        // Generate the actual time
        const today = DateTime.now();

        // Generate the +24h time
        const tomorrow = DateTime.now().plus({ days: 1 });
        // Get the group(s) that the user belongs to
        let user: any = await User.findById(userId)
            .select('_groups');

        // Fetch the tasks and events
        let posts: any = await Post.find({
                '_group': { $in: user._groups },
                'created_date': { $gte: today.toJSDate(), $lt: tomorrow.toJSDate() }
            })
            .sort('-created_date')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean() || []

        // Filter out the posts belonging to the current user
        posts = posts.filter((post: any) => post._posted_by._id.toString() !== userId) || [];

        // Return posts
        return posts;
    }


    /**
     * This function is resposible for fetching the global feed posts 
     * @param userId 
     */
    async getGlobalFeed(userId: string) {

        // Get Today's Events
        let events: any = await this.getTodayEvents(userId);

        // Get Today's tasks
        let tasks: any = await this.getTodayTasks(userId);

        // Get Recent posts
        let posts: any = await this.getRecentPosts(userId);

        // Return set of recent posts, today's events and today's tasks
        return {
            events: events,
            tasks: tasks,
            posts: posts
        }

    }

    /**
     * This function is responsible for fetching overdue tasks of a member in a specific group
     * @param userId 
     * @param groupId
     */
    async getWorkloadCardOverdueTasks(userId: string, groupId: string) {

        // Generate the actual time
        const today = DateTime.now();

        let tasks = [];
        let query = {};
        if (!!groupId) {
          query = {
                $and: [
                    { '_group': groupId },
                    { '_assigned_to': userId },
                    { 'type': 'task' },
                    { 'task.is_template': { $ne: true }},
                    { 'task.due_to': { $lt: today.toISODate() } },
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' }
                        ]
                    }
                ]
            }
        } else {
            query = {
                $and: [
                    { '_assigned_to': userId },
                    { 'type': 'task' },
                    { 'task.is_template': { $ne: true }},
                    { 'task.due_to': { $lt: today.toISODate() } },
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' }
                        ]
                    }
                ]
            }
        }

        tasks = await Post.find(query)
            .sort('-task.due_to')
            .select(this.postFields)
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_created_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return tasks
        return tasks
    }

    /**
     * This function is responsible for fetching overdue tasks of a member in a specific group
     * @param userId 
     * @param groupId
     */
    async getWorkloadCardOverduePortfolioTasks(userId: string, portfolioId: string) {

        // Find the Portfolio based on the portfolioId
        let portfolio = await Portfolio.findOne({
                _id: portfolioId
            })
            .select('_groups')
            .lean();

        // Generate the actual time
        const today = DateTime.now();

        // Fetch the tasks posts
        const tasks = await Post.find({
                $and: [
                    { _assigned_to: userId },
                    { _group: { $in : portfolio?._groups }},
                    { 'task.due_to': { $lt: today.toJSDate() }},
                    { 'task.is_template': { $ne: true }},
                    {
                        $or: [
                            { 'task.status': 'to do' },
                            { 'task.status': 'in progress' }
                        ]
                    }
                ]
            })
            .sort('-task.due_to')
            .populate('_group', this.groupFields)
            .populate('_posted_by', this.userFields)
            .populate('_assigned_to', this.userFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return tasks
        return tasks
    }
}