import { Group, User } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError, hasProperty } from '../../utils';
import { Readable } from 'stream';

/*  ===================
 *  -- GROUP METHODS --
 *  ===================
 * */

export class GroupController {
    /**
     * This function fetches first 10 groups present in the database
     * @param res 
     */
    async getAllGroupsList(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch first 10 groups in the database which are not private
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } }]
            })
                .sort('_id')
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .limit(10)
                .lean() || [];

            // Send the status 200 response
            if (groups.length == 1) {
                return res.status(200).json({
                    message: `Only ${groups.length} group exists in the database!`,
                    groups: groups
                });
            }

            return res.status(200).json({
                message: `First ${groups.length} groups found in the database!`,
                groups: groups,
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches next 5 groups which exist in the database based on the list of @lastGroupId
     * @param req 
     * @param res 
     */
    async getNextAllGroupsList(req: Request, res: Response) {
        try {

            const { lastGroupId } = req.query;

            // If lastGroupId is null or not provided then we throw BAD REQUEST 
            if (!lastGroupId) {
                return res.status(400).json({
                    message: 'Please provide the lastGroupId as the query parameter!'
                })
            }

            // Fetch next 5 groups in the database based on the list of @lastGroupId which are not private
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _id: { $gt: lastGroupId } }]
            })
                .sort('_id')
                .limit(5)
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .lean() || [];

            // Send the status 200 response
            return res.status(200).json({
                message: `The next ${groups.length} groups!`,
                groups: groups
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async getUserGroups(req: Request, res: Response, next: NextFunction) {
        try {

            const { workspaceId, userId } = req.query;

            // If either workspaceId or userId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId || !userId) {
                return res.status(400).json({
                    message: 'Please provide both workspaceId and userId as the query parameter!'
                })
            }

            // Finding groups for the user of which they are a part of
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId, },
                    { $or: [{ _members: userId }, { _admins: userId }] },
                    // { type: { $ne: 'smart' } }
                ]
            })
                .sort('_id')
                .limit(10)
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    }
                })
                .lean() || []

            // If there are no groups then we send error response
            if (!groups) {
                return sendError(res, new Error('Oops, no groups found!'), 'Group not found, Invalid workspaceId or userId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `${groups.length} groups found.`,
                groups
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches next 5 groups which exist in the database based on the list of @lastGroupId
     * @param req 
     * @param res 
     */
    async getNextUserGroups(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId, userId } = req.query;
            const { lastGroupId } = req.params;

            // If lastGroupId, workspaceId, or userId is null or not provided then we throw BAD REQUEST 
            if (!lastGroupId || !workspaceId || !userId) {
                return res.status(400).json({
                    message: 'Please provide the lastGroupId, workspaceId, and userId as the query parameter!'
                })
            }

            // Fetch next 5 groups in the database based on the list of @lastGroupId which are not private
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId, },
                    { $or: [{ _members: userId }, { _admins: userId }] },
                    { _id: { $gt: lastGroupId } }
                ]
            })
                .sort('_id')
                .limit(5)
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    }
                })
                .lean() || [];

            // Send the status 200 response
            return res.status(200).json({
                message: `The next ${groups.length} groups!`,
                groups: groups
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches the group details corresponding to the @constant groupId 
     * @param req - @constant groupId
     */
    async get(req: Request, res: Response) {
        try {

            const { groupId } = req.params;

            // Find the Group based on the groupId
            const group = await Group.findOne({
                _id: groupId
            })
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .lean();

            // Check if group already exist with the same groupId
            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Group found!',
                group
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates the new group in workspace
     * @param req - @constant group_name, @constant workspace_name, @constant workspaceId, @constant userId
     * 
     * It Does the following:-
     * 
     * 1. Find and checks if a group exist on the basis of @workspaceId and @group_name
     * 2. Updates the _groups array in the corresponding User Document
     */
    async create(req: Request, res: Response) {
        try {

            // Preparing the group data
            const groupData = {
                group_name: req.body.group_name,
                workspace_name: req.body.workspace_name,
                _workspace: req.body.workspaceId,
                _admins: req.body.userId,
                type: req.body.type,
                members_count: 1
            }

            // Checking if group already exists
            const groupExist = await Group.findOne({
                $and: [
                    { group_name: groupData.group_name },
                    { _workspace: groupData._workspace }
                ]
            });

            // If Group Exists in the workspace, then send error response
            if (groupExist) {
                return res.status(409).json({
                    message: 'Oops group name already exist, please try a different one!'
                })
            }

            // If group doesn't exists, then create a new document
            const group = await Group.create(groupData);

            // Find the user and update the _groups array in the corresponding user document 
            const user = await User.findByIdAndUpdate({
                _id: groupData._admins,
                _workspace: groupData._workspace
            }, {
                $push: {
                    _groups: group
                }
            }, {
                new: true
            }).lean();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Group Created Successfully!',
                group: group
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the group data to the corresponding @constant groupId
     * @param req - @constant groupId 
     * It only Updates @group_name and @description
     */
    async update(req: Request, res: Response) {
        try {
            const groupId = req.params.groupId;

            const group: any = await Group.findOneAndUpdate(
                { _id: groupId },
                { $set: req.body.groupData },
                { new: true }
            )
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic role email created_date',
                    options: {
                        limit: 10
                    }
                })
                .lean();

            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, invalid groupId!', 404);
            }

            return res.status(200).json({
                message: `${group.group_name} group was updated successfully!`,
                group: group
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function deletes the group from the database to the corresponding @constant groupId
     * @param req - @constant groupId
     * @param res 
     */
    async remove(req: Request, res: Response) {

        const { groupId } = req.params;

        try {

            // Find the group and remove it from the database
            const group: any = await Group.findByIdAndDelete(groupId)
                .select('group_name')

            // Find list of users who were part of this group 
            const users = await User.find({
                _groups: groupId
            })

            // Creating a readable stream from users list
            const userStream = Readable.from(users);

            // Updating the Users
            userStream.on('data', async function (user) {
                // Find the user and update the _groups array in the corresponding user document 
                await User.findOneAndUpdate({
                    $and: [
                        { _id: user._id, },
                        { _workspace: group._workspace }
                    ]
                }, {
                    $pull: {
                        _groups: group._id
                    }
                }, {
                    new: true
                })
            })

            // Delete Posts and Files too(create the API for this and serve as a microservice)

            // Send the status 200 response
            return res.status(200).json({
                message: 'Group deleted successfully!',
                group: group
            });
        } catch (error) {
            return sendError(res, error);
        }
    }

    /**
     * This function is responsible for updating the image for the particular group
     * @param { userId, fileName }req 
     * @param res 
     */
    async updateImage(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the fileName from fileHandler middleware
        const fileName = req['fileName'];

        try {

            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                group_avatar: fileName
            }, {
                new: true
            }).select('group_name group_avatar');

            // Send status 200 response
            return res.status(200).json({
                message: 'Group avatar updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }


    async getAgoraGroupsNotJoined(req: Request, res: Response, next: NextFunction){
        try {
            const { workspaceId, userId } = req.query;

            if (!workspaceId || !userId) {
                return res.status(400).json({
                    message: 'Please provide both workspaceId and userId as the query parameter!'
                })
            }

            const agoraGroups = await Group.find({
                $and: [
                    { _members: { $ne: userId} },
                    { _admins: { $ne: userId} },
                    { _workspace: workspaceId },
                    { type: "agora" },
                ]
            })
            .sort('group_name')
                .limit(10)
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    }
                })
                .lean() || []

                return res.status(200).json({
                    message: `Agora groups retrieved successfully!`,
                    group: agoraGroups
                });
    
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }


    async joinAgoraGroup(req: Request, res: Response, next: NextFunction){
        try {
            const { groupId, userId } = req.body;

            if (!groupId || !userId) {
                return res.status(400).json({
                    message: 'Please provide both groupId and userId as the query parameter!'
                })
            }

            // Add User to group
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                $addToSet: {
                     _members: userId
                },
                $inc: { members_count: 1 }
            },{
                new: true
            });

            // Add Group to user
            const user = await User.findByIdAndUpdate({
                _id: userId
            }, {
                $addToSet: {
                    _groups: groupId
                }
            }, {
                new: true
            });

            return res.status(200).json({
                message: `User added to group successfully!`,
            });

        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }
}