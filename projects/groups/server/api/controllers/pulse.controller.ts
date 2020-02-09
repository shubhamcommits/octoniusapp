import moment from 'moment';
import { Group, Post } from '../models';
import { sendError } from '../../utils';
import { Request, Response } from 'express';

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
                        "pulse_description": pulse_description
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
                    { group_name: { $not: { $eq: 'private' || 'personal' } } },
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
                    { group_name: { $not: { $eq: 'private' || 'personal' } } },
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
    };

}