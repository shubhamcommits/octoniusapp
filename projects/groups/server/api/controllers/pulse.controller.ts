import { Group } from '../models';
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
    * @param {*} next 
    */
    async getPulseGroups(req: Request, res: Response) {
        try {
            const { workspaceId } = req.query;

            const groups = await Group.find({
                $and: [
                    { group_name: { $not: { $eq: 'private' } } },
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
    * @param {*} next 
    */
    async getNextPulseGroups(req: Request, res: Response) {
        try {
            const { workspaceId, lastGroupId } = req.query;

            const groups = await Group.find({
                $and: [
                    { group_name: { $not: { $eq: 'private' } } },
                    { _workspace: workspaceId },
                    { _id: { $lt: lastGroupId } }]
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

}