/*  =============
 *  -- IMPORTS --
 *  =============
 */
const { Group } = require('../models');
const { sendErr } = require('../../utils');

/**
 * This function fetches the pulse description for a group
 * @param {* groupId } req 
 * @param {*} res 
 */
const get = async (req, res) => {
    try {
        const { query: { groupId } } = req;

        const group = await Group.findById(
            groupId,
        ).select('group_name pulse_description');

        return res.status(200).json({
            message: 'Pulse Description found!',
            group_name: group.group_name,
            pulse_description: group.pulse_description
        });
    } catch (err) {
        return sendErr(res, err);
    }
};

/**
 * This function is responsible for editing the pulse description for a group
 * @param {* groupId } req 
 * @param {*} res 
 */
const edit = async (req, res) => {
    try {
        const { query: { groupId }, body: { pulse_description} } = req;
        
        const group = await Group.findByIdAndUpdate(
            groupId,
            {
                $set: {
                    "pulse_description": pulse_description
                }
            }
        ).select('group_name pulse_description');

        return res.status(200).json({
            message: 'Pulse Description edited!',
            groupId: groupId,
            group_name: group.group_name,
            request: req.body == null ? "body is null" : req.body
        });
    } catch (err) {
        return sendErr(res, err);
    }
};


/** This function fetches first 10 groups present in the workspace for pulse
* @param {* workspaceId } req 
* @param {*} res 
* @param {*} next 
*/
const getPulseGroups = async (req, res, next) => {
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

        if(groups.length == 1){
            return res.status(200).json({
                message: `Only ${groups.length} group exists!`,
                groups: groups
            });
        }

        return res.status(200).json({
            message: `The first ${groups.length} groups!`,
            groups: groups
        });
    } catch (err) {
        return sendErr(res, err);
    }
};

/**
* This function fetches next 5 groups present in the workspace for pulse
* @param {* workspaceId, lastGroupId } req 
* @param {*} res 
* @param {*} next 
*/
const getNextPulseGroups = async (req, res, next) => {
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

        return res.status(200).json({
            message: `The next ${groups.length} groups!`,
            groups: groups
        });
    } catch (err) {
        return sendErr(res, err);
    }
};

/*  =============
 *  -- EXPORTS --
 *  =============
 */
module.exports = { getPulseGroups, getNextPulseGroups }