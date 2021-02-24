import { Group, Post, User } from "../models";
import moment from "moment";

export class PostsService {

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar';

    /**
     * This function is responsible for fetching todays task for the user
     * @param userId 
     */
    async getTodayTasks(userId: string) {

        // Generate the actual time
        const startOfDay = moment().startOf('day').format('YYYY-MM-DD');

        // Generate the +24h time
        const endOfDay = moment().endOf('day').format('YYYY-MM-DD');

        const user = await User.findById(userId).select('_private_group');

        // Fetch users task for today
        const tasks = await Post.find({
            $and: [
                { $or: [
                        { '_assigned_to': userId },
                        { '_group': user._private_group }
                    ]
                },
                { 'task.due_to': { $gte: startOfDay, $lte: endOfDay }},
                { 'task.is_template': { $ne: true }},
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
        const today = moment().format('YYYY-MM-DD');

        // Fetch the tasks posts
        const tasks = await Post.find({
            $and: [
                { $or: [
                        { '_assigned_to': userId },
                        { '_group': user._private_group }
                    ]
                },
                { 'task.due_to': { $lt: today }},
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

    /**
     * This function is responsible for fetching tasks due this week
     * @param userId 
     */
    async getThisWeekTasks(userId: string) {

        const user = await User.findById(userId).select('_private_group');

        // Generate the today
        const tomorrow = moment().add(1, 'days').startOf('day').format('YYYY-MM-DD');

        // Generate the date for the end of the week
        const endOfWeek = moment().add(1, 'days').endOf('day').endOf('isoWeek').format('YYYY-MM-DD');

        // Fetch the tasks posts
        const tasks = await Post.find({
            $and: [
                { $or: [
                        { '_assigned_to': userId },
                        { '_group': user._private_group }
                    ]
                },
                { 'task.due_to': { $gte: tomorrow, $lte: endOfWeek }},
                { 'task.is_template': { $ne: true }},
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
        const endOfWeek = moment().add(1, 'days').endOf('day').endOf('isoWeek').format('YYYY-MM-DD');

        // Generate the date for the end of the next week
        const endOfNextWeek = moment().endOf('isoWeek').add(1, 'days').endOf('day').endOf('isoWeek').format('YYYY-MM-DD');

        // Fetch the tasks posts
        const tasks = await Post.find({
            $and: [
                { $or: [
                        { '_assigned_to': userId },
                        { '_group': user._private_group }
                    ]
                },
                {'task.due_to': { $gt: endOfWeek, $lte: endOfNextWeek }},
                { 'task.is_template': { $ne: true }},
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
        const todayPlus14Days = moment().add(14, 'days').endOf('day').format('YYYY-MM-DD');

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
                        { 'task.due_to': { $gte: todayPlus14Days }},
                        { 'task.due_to': null }
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

        // Generate the actual time
        const startOfDay = moment().startOf('day').format();

        // Generate the +24h time
        const endOfDay = moment().endOf('day').format();

        // Find the user's today agenda events
        const events = await Post.find({

            // Find events due to today
            'type': 'event',
            $or: [
                { '_assigned_to': userId },
                // { '_assigned_to': 'all' }
                { '_group': user._private_group }
            ],
            'event.due_to': { $gte: startOfDay, $lte: endOfDay }

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
        const todayForEvent = moment().add(1, 'days').startOf('day').format();

        // Generate the +24h time
        const todayPlus7Days = moment().add(7, 'days').endOf('day').format();

        // Find the user's today agenda events
        const events = await Post.find({

            // Find events due to this week
            'type': 'event',
            $or: [
                { '_assigned_to': userId },
                // { '_assigned_to': 'all' }
                { '_group': user._private_group }
            ],
            'event.due_to': { $gte: todayForEvent, $lte: todayPlus7Days }
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
        const today = moment().startOf('day').format('YYYY-MM-DD');

        // Generate the +24h time
        const tomorrow = moment().endOf('day').format('YYYY-MM-DD');

        // Get the group(s) that the user belongs to
        let user: any = await User.findById(userId)
            .select('_groups');

        // Fetch the tasks and events
        let posts: any = await Post.find({
            '_group': { $in: user._groups },
            'created_date': { $gte: today, $lt: tomorrow }
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

}