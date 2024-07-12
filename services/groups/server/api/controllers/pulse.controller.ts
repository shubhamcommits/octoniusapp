import moment from 'moment';
import { Group, Post } from '../models';
import { sendError } from '../../utils';
import { Request, Response, NextFunction } from 'express';

/*  ===================
 *  -- PULSE METHODS --
 *  ===================
 * */

export class PulseController {
    /**
     * This function fetches the pulse description for a group
     * @param {* groupId } req 
     * @param {*} res 
     */
    async get(req: Request, res: Response) {
        try {
            const { query: { groupId } } = req;

            const group = await Group.findById(
                groupId,
            ).select('group_name pulse_description');

            // Send the status 200 response
            return res.status(200).json({
                message: 'Pulse Description found!',
                group: group
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for editing the pulse description for a group
     * @param {* groupId, pulse_description } req 
     * @param {*} res 
     */
    async edit(req: Request, res: Response) {
        try {
            const { query: { groupId }, body: { pulse_description } } = req;

            const group = await Group.findByIdAndUpdate(
                groupId,
                {
                    $set: {
                        pulse_description: pulse_description
                    },
                    $push: { "records.pulses": {
                            date: moment().format(),
                            description: pulse_description
                        }
                    }
                }
            ).select('group_name pulse_description');

            // Send the status 200 response
            return res.status(200).json({
                message: 'Pulse Description edited!',
                group: group
            });
        } catch (err) {
            return sendError(res, err);
        }
    };


    /** This function fetches first 10 groups present in the workspace for pulse
    * @param {* workspaceId } req 
    * @param {*} res
    */
    async getPulseGroups(req: Request, res: Response) {
        try {
            const { workspaceId } = req.query;

            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId }
                ]
            })
                .sort('_id')
                .limit(10)
                .select('_id group_name group_avatar description pulse_description')
                .lean() || [];

            // Send the status 200 response
            if (groups.length == 1) {
                return res.status(200).json({
                    message: `Only ${groups.length} group exists!`,
                    groups: groups
                });
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `The first ${groups.length} groups!`,
                groups: groups
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
    * This function fetches next 5 groups present in the workspace for pulse
    * @param {* workspaceId, lastGroupId } req 
    * @param {*} res
    */
    async getNextPulseGroups(req: Request, res: Response) {
        try {
            const { workspaceId, lastGroupId } = req.query;

            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId },
                    { _id: { $gt: lastGroupId } }]
            })
                .sort('_id')
                .limit(5)
                .select('_id group_name group_avatar description pulse_description')
                .lean() || [];

            // Send the status 200 response
            return res.status(200).json({
                message: `The next ${groups.length} groups!`,
                groups: groups
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the task count for a group on the basis of groupId and task status
     * @param { groupId, status } req 
     * @param res 
     */
    async getPulseTasks(req: Request, res: Response) {
        try {
            const { groupId, status } = req.query;

            // Defining Start of week
            const start = moment().local().startOf('week').format('YYYY-MM-DD');

            // Calculating End date of week
            const end = moment().local().endOf('week').format('YYYY-MM-DD');

            // Posts array
            let numTasks = 0;

            // Checks if we have status incoming in the query or not
            if (req.query.status) {

                // If status is 'done' then fetch all the tasks which have status as 'done' or 'completed'
                if (req.query.status == 'done') {
                    numTasks = await Post.find({
                        $and: [
                            { type: 'task' },
                            { _group: groupId },
                            {
                                $or: [
                                    { 'task.status': 'done' },
                                    { 'task.status': 'completed' },
                                ]
                            },
                            { 'task.due_to': { $gte: start, $lte: end } }
                        ]
                    }).countDocuments()
                }
                // If status is not 'done' then fetch the respectives
                else {
                    numTasks = await Post.find({
                        $and: [
                            { type: 'task' },
                            { _group: groupId },
                            { 'task.status': status },
                            { 'task.due_to': { $gte: start, $lte: end } }
                        ]
                    }).countDocuments()
                }

                // Send the status 200 response
                return res.status(200).json({
                    message: `Found ${numTasks} ${status} tasks!`,
                    numTasks: numTasks,
                });

            }
            // If status is not there in the query then fetch all the tasks which are there in that week
            else {
                numTasks = await Post.find({
                    $and: [
                        { type: 'task' },
                        { _group: groupId },
                        { 'task.due_to': { $gte: start, $lte: end } }
                    ]
                }).countDocuments()

                // Send the status 200 response
                return res.status(200).json({
                    message: `Found ${numTasks} total tasks!`,
                    numTasks: numTasks,
                });
            }
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches the undone task count for a group which were due this week
     * @param { query: { groupId } }req 
     * @param res 
     * @param next 
     */
    async getTasksUndoneLastWeek(req: Request, res: Response, next: NextFunction) {
        
        // Fetch GroupId from the request
        const { query: { groupId } } = req;
        
        try {

            // Defining Start of week
            const start = moment().local().startOf('week').subtract(1, 'weeks').format('YYYY-MM-DD');

            // Calculating End date of week
            const end = moment().local().endOf('week').subtract(1, 'weeks').format('YYYY-MM-DD');

            // If status is not 'done' then fetch the respectives
            const numTasks = await Post.find({
                $and: [
                    { type: 'task' },
                    { _group: groupId },
                    { $or: [{ 'task.status': 'to do' }, { 'task.status': 'in progress' }] },
                    { 'task.due_to': { $gte: start, $lte: end } }
                ]
            }).countDocuments()

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${numTasks} total tasks.`,
                numTasks: numTasks
            });

        } catch (err) {
            return sendError(res, err);
        }
    }


    /** 
     * This function fetches groups present in the workspace for pulse
     * @param {* workspaceId } req 
     * @param {*} res
     */
    async getGlobalPerformanceGroups(req: Request, res: Response) {
        try {
            const { workspaceId, period } = req.query;
            
            const comparingDate = moment().local().subtract(+period, 'days').format('YYYY-MM-DD');

            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { project_type: true },
                    { _workspace: workspaceId },
                    { created_date: { $gte: comparingDate } }
                ]
            })
                .sort('_id')
                .select('_id group_name group_avatar description project_status')
                .lean() || [];

            // Send the status 200 response
            if (groups.length == 1) {
                return res.status(200).json({
                    message: `Only ${groups.length} group exists!`,
                    groups: groups
                });
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `The groups!`,
                groups: groups
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the task count for a group on the basis of groupId and task status
     * @param { groupId, status } req 
     * @param res 
     */
    async getGlobalPerformanceTasks(req: Request, res: Response) {
        try {
            const { groupId, period, status } = req.query;

            const comparingDate = moment().local().subtract(+period, 'days').format('YYYY-MM-DD');

            // Posts array
            let numTasks = 0;
            
            if (status) {
                if (status === 'done') {
                    numTasks = await Post.find({
                        $and: [
                            { type: 'task' },
                            { _group: groupId },
                            {
                                $or: [
                                    { 'task.status': 'done' },
                                    { 'task.status': 'completed' },
                                ]
                            },
                            { 'task.due_to': { $gte: comparingDate } }
                        ]
                    }).countDocuments()
                } else {
                    numTasks = await Post.find({
                        $and: [
                            { type: 'task' },
                            { 'task.status': status },
                            { _group: groupId },
                            { 'task.due_to': { $gte: comparingDate } }
                        ]
                    }).countDocuments();
                }
            } else {
                numTasks = await Post.find({
                    $and: [
                        { type: 'task' },
                        { _group: groupId },
                        { 'task.due_to': { $gte: comparingDate } }
                    ]
                }).countDocuments()
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${numTasks} total tasks!`,
                numTasks: numTasks,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function fetches the task count for a project on the basis of groupId and task status
     * @param { groupId, status } req 
     * @param res 
     */
    async getKpiPerformanceTasks(req: Request, res: Response) {
        try {
            const { columnId, status } = req.query;

            // Posts array
            let numTasks = 0;
            
            if (status) {
                if (status === 'done') {
                    numTasks = await Post.find({
                        $and: [
                            { type: 'task' },
                            { 'task._column': columnId },
                            {
                                $or: [
                                    { 'task.status': 'done' },
                                    { 'task.status': 'completed' },
                                ]
                            }
                        ]
                    }).countDocuments()
                } else {
                    numTasks = await Post.find({
                        $and: [
                            { type: 'task' },
                            { 'task.status': status },
                            { 'task._column': columnId }
                        ]
                    }).countDocuments();
                }
            } else {
                numTasks = await Post.find({
                    $and: [
                        { type: 'task' },
                        { 'task._column': columnId }
                    ]
                }).countDocuments()
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${numTasks} total tasks!`,
                numTasks: numTasks,
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
    * This function fetches the pulse count for a workspace on a period
    * @param { workspaceId, period } req 
    * @param res 
    */
   async getPulseCount(req: Request, res: Response) {
       try {
            const { workspaceId, filteringGroups, period } = req.query;

            const comparingDate = moment().local().subtract(+period, 'days').toDate();

            let numPulse = 0;

            let groups = [];
            
            if (period !== 'undefined') {
                if (!!filteringGroups && filteringGroups != 'undefined' && Number(filteringGroups.length) && Number(filteringGroups.length) > 0) {
                    groups = await Group.find({
                        $and: [
                            { _id: { $in: filteringGroups }},
                            { group_name: { $ne: 'personal' } },
                            { group_name: { $ne: 'private' } },
                            { _workspace: workspaceId },
                            { pulse_description: { $nin:[null,""] } }
                        ]
                    }).select("_id pulse_description records");
                } else {
                    groups = await Group.find({
                        $and: [
                            { group_name: { $ne: 'personal' } },
                            { group_name: { $ne: 'private' } },
                            { _workspace: workspaceId },
                            { pulse_description: { $nin:[null,""] } }
                        ]
                    }).select("_id pulse_description records");
                }

                for (let group of groups) {
                    for (let pulse of group['records']['pulses']) {
                        if (pulse['date'].getTime() >= comparingDate.getTime()) {
                            numPulse++;
                        }
                    }
                }

            } else {
                if (!!filteringGroups && filteringGroups != 'undefined' && Number(filteringGroups.length) && Number(filteringGroups.length) > 0) {
                    numPulse = await Group.find({
                        $and: [
                            { _id: { $in: filteringGroups }},
                            { group_name: { $ne: 'personal' } },
                            { group_name: { $ne: 'private' } },
                            { _workspace: workspaceId },
                            { pulse_description: { $nin:[null,""] } }
                        ]
                    }).countDocuments();
                } else {
                    numPulse = await Group.find({
                        $and: [
                            { group_name: { $ne: 'personal' } },
                            { group_name: { $ne: 'private' } },
                            { _workspace: workspaceId },
                            { pulse_description: { $nin:[null,""] } }
                        ]
                    }).countDocuments();
                }
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${numPulse} Pulses!`,
                numPulse: numPulse,
            });
           
       } catch (err) {
           return sendError(res, err);
       }
   }
}