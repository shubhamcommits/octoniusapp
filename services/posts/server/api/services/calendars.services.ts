import { Post } from '../models';
import moment from 'moment';

/*  =======================
 *  -- Calendar Service --
 *  =======================
 */

export class CalendarService {

    async getCalendarPosts(year: number, month: string, groupId: string, userId?: string) {
            // Create current date in view
            const date = moment().month(month).year(year);

            // Find posts between the start and end of given month
            const startOfMonthEvent = date.startOf('month').toDate();
            const endOfMonthEvent = date.endOf('month').toDate();

            // Convert format to match date from frontend
            const convertedStartMonthEvent = moment(startOfMonthEvent).utc().format('YYYY-MM-DDTHH:mm:ss');
            const convertedEndOfMonthEvent = moment(endOfMonthEvent).utc().format('YYYY-MM-DDTHH:mm:ss');

            // Tasks are saved under different format in DB
            const startOfMonthTask = date.startOf('month').format('YYYY-MM-DD');
            const endOfMonthTask = date.endOf('month').format('YYYY-MM-DD');

            // Fetch the posts from a specific group AND either type task/event AND between the start and the end of the month given
            let posts: any = []

            // If userId doesn't exist
            if (!userId) {
                posts = await Post.find({
                    $and: [
                        { _group: groupId },
                        {
                            $or: [
                                { type: 'event' },
                                { type: 'task' }
                            ]
                        },
                        {
                            $or: [
                                { 'event.due_to': { $gte: convertedStartMonthEvent, $lte: convertedEndOfMonthEvent } },
                                { 'task.due_to': { $gte: startOfMonthTask, $lte: endOfMonthTask } }
                            ]
                        }
                    ]
                })
            } else if (userId) {
                posts = await Post.find({
                    $and: [
                        { _group: groupId },
                        {
                            $or: [
                                { type: 'event' },
                                { type: 'task' }
                            ]
                        },
                        {
                            $or: [
                                { 'task._assigned_to': userId },
                                {
                                    $or: [
                                        { 'event._assigned_to': userId },
                                        { 'event._assigned_to': 'all' },
                                    ]
                                }
                            ]
                        },
                        {
                            $or: [
                                { 'event.due_to': { $gte: convertedStartMonthEvent, $lte: convertedEndOfMonthEvent } },
                                { 'task.due_to': { $gte: startOfMonthTask, $lte: endOfMonthTask } }
                            ]
                        }
                    ]
                })
            }

            // Return posts array
            return posts || []
    }

}

