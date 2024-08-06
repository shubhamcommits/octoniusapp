import { Post } from '../models';
import { DateTime } from 'luxon';

/*  =======================
 *  -- Calendar Service --
 *  =======================
 */

export class CalendarService {

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar workspace_name';

    /**
     * This function is responsible for fetching tasks due this week
     * @param userId 
     */
    async getMonthTasks(month: any, year: any, groupId: any, userId?: any) {

        // current date in view
        const date = DateTime.fromObject({ year: parseInt(year), month: parseInt(month)});

        // Generate the actual time
        const startOfMonth = date.startOf('month');

        // Generate the 30 days time
        const endOfMonth = date.endOf('month');

        // Tasks List
        let tasks: any = []

        // Fetch the tasks posts
        if(userId === undefined)
            tasks = await Post.find({
                    '_group': groupId,
                    'type': 'task',
                    'task.due_to': { $gte: startOfMonth, $lte: endOfMonth }
                })
                .sort('-task.due_to')
                .populate('_group', this.groupFields)
                .populate('_posted_by', this.userFields)
                .populate('_assigned_to', this.userFields)
                .populate('_followers', this.userFields)
                .populate('_liked_by', this.userFields)
                .lean();

        // Find user's month tasks
        else
            tasks = await Post.find({
                    '_assigned_to': userId,
                    'task.due_to': { $gte: startOfMonth, $lte: endOfMonth },
                    $or: [
                        { 'task.status': 'to do' },
                        { 'task.status': 'in progress' },
                        { 'task.status': 'done' }
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
     * This function is responsible for fetching events due this month
     */
    async getMonthEvents(month: any, year: any, groupId: any, userId?: any) {

        // current date in view
        const date = DateTime.fromObject({ year: parseInt(year), month: parseInt(month)})

        // Generate the actual time
        const startOfMonth = date.startOf('month');

        // Generate the 30 days time
        const endOfMonth = date.endOf('month');

        // Events list object
        let events: any = [];

        // Find the group's month events
        if(userId === undefined)
            events = await Post.find({

                // Find events due to this month
                '_group': groupId,
                'type': 'event',
                'event.due_to': { $gte: startOfMonth, $lte: endOfMonth }
            })
            .sort('event.due_to')
            .populate('_posted_by', this.userFields)
            .populate('_group', this.groupFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Find the user's month events
        else 
            events = await Post.find({

                // Find events due to this week
                'type': 'event',
                $or: [
                    { '_assigned_to': userId },
                    // { '_assigned_to': 'all' }
                ],
                'event.due_to': { $gte: startOfMonth, $lte: endOfMonth }
            })  
            .sort('event.due_to')
            .populate('_posted_by', this.userFields)
            .populate('_group', this.groupFields)
            .populate('_followers', this.userFields)
            .populate('_liked_by', this.userFields)
            .lean();

        // Return Events
        return events
    }

    /**
     * This function is resposible for fetching the calendar posts
     * @param month
     * @param year
     */
    async getMonthCalendarPosts(month: any, year: any, groupId: any, userId?: any) {

        // Get Events
        let events: any = await this.getMonthEvents(month, year, groupId, userId);

        // Get Tasks
        let tasks: any = await this.getMonthTasks(month, year, groupId, userId);

        // Return set of events and tasks
        return {
            events: events,
            tasks: tasks,
        }

    }

}

