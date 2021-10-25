import { Column, Flow, Group, Post, User, Notification, Workspace } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError, hasProperty, axios } from '../../utils';
import http from 'axios';
import moment from 'moment';

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

            const { workspaceId } = req.query;

            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                });
            }

            // Fetch first 10 groups in the database which are not private
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
                ]
            })
                .sort('_id')
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .limit(20)
                .lean() || [];

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

            const { workspaceId, lastGroupId } = req.query;

            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                });
            }

            // If lastGroupId is null or not provided then we throw BAD REQUEST 
            if (!lastGroupId) {
                return res.status(400).json({
                    message: 'Please provide the lastGroupId as the query parameter!'
                })
            }

            // Fetch next 5 groups in the database based on the list of @lastGroupId
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId },
                    { _id: { $gt: lastGroupId } },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
                ]
            })
                .sort('_id')
                .limit(5)
                .populate({
                    path: '_members',
                    select: 'first_name last_name active profile_pic role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name active profile_pic role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    },
                    match: {
                        active: true
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
     * This function fetches first 10 archived groups present in the database
     * @param res 
     */
    async getAllArchivedGroupsList(req: Request, res: Response, next: NextFunction) {
        try {

            const { workspaceId } = req.query;

            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                });
            }

            // Fetch first 10 groups in the database
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId },
                    { archived_group: true }
                ]
            })
                .sort('_id')
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .limit(20)
                .lean() || [];

            return res.status(200).json({
                message: `First ${groups.length} groups found in the database!`,
                groups: groups,
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches next 5 archived groups which exist in the database based on the list of @lastGroupId
     * @param req 
     * @param res 
     */
    async getNextAllArchivedGroupsList(req: Request, res: Response) {
        try {

            const { workspaceId, lastGroupId } = req.query;

            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                });
            }

            // If lastGroupId is null or not provided then we throw BAD REQUEST 
            if (!lastGroupId) {
                return res.status(400).json({
                    message: 'Please provide the lastGroupId as the query parameter!'
                })
            }

            // Fetch next 5 groups in the database based on the list of @lastGroupId
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId },
                    { _id: { $gt: lastGroupId } },
                    { archived_group: true }
                ]
            })
                .sort('_id')
                .limit(5)
                .populate({
                    path: '_members',
                    select: 'first_name last_name active profile_pic role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name active profile_pic role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    },
                    match: {
                        active: true
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

    async getAllManagerGroups(req: Request, res: Response, next: NextFunction) {
        try {

            const { userId } = req.query;
            const { workspaceId } = req.params;

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
                    { _workspace: workspaceId },
                    { _admins: userId },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
                ]
            })
                .sort('_id')
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
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

    async getAllUserGroups(req: Request, res: Response, next: NextFunction) {
        try {

            const { userId } = req.query;
            const { workspaceId } = req.params;

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
                    { _workspace: workspaceId },
                    { $or: [{ _members: userId }, { _admins: userId }] },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
                    // { type: { $ne: 'smart' } }
                ]
            })
                .sort('_id')
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
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
                    { _workspace: workspaceId },
                    { $or: [{ _members: userId }, { _admins: userId }] },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
                    // { type: { $ne: 'smart' } }
                ]
            })
                .sort('_id')
                //.limit(10)
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
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
                    { _id: { $gt: lastGroupId } },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
                ]
            })
                .sort('_id')
                .limit(5)
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
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
            var group = await Group.findOne({
                _id: groupId
            })
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
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
            let group = await Group.create(groupData);

            const default_CF = {
                title: 'Priority',
                name: 'priority',
                values: ['Low', 'Medium', 'High']
            };

            // Find the group and update their respective group avatar
            group = await Group.findByIdAndUpdate({
                _id: group._id
            }, {
                //custom_fields: newCustomField
                $push: { "custom_fields": default_CF }
            }, {
                new: true
            })

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

            // Send new workspace to the mgmt portal
            // Obtain the workspace of the group
            const workspace = await Workspace.findOne({ _id: groupData._workspace });

            // Count all the groups present inside the workspace
            const groupsCount: number = await Group.find({ $and: [
                { group_name: { $ne: 'personal' } },
                { _workspace: groupData._workspace }
            ]}).countDocuments();

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: groupData._workspace }
            ] }).countDocuments();

            // Count all the users present inside the workspace
            const guestsCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: groupData._workspace },
                { role: 'guest'}
            ] }).countDocuments();

            let workspaceMgmt = {
                _id: groupData._workspace,
                company_name: workspace.company_name,
                workspace_name: workspace.workspace_name,
                owner_email: workspace.owner_email,
                owner_first_name: workspace.owner_first_name,
                owner_last_name: workspace.owner_last_name,
                _owner_remote_id: workspace._owner._id || workspace._owner,
                environment: process.env.DOMAIN,
                num_members: usersCount,
                num_invited_users: guestsCount,
                num_groups: groupsCount,
                created_date: workspace.created_date,
                access_code: workspace.access_code,
                management_private_api_key: workspace.management_private_api_key
            }
            axios.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                API_KEY: workspace.management_private_api_key,
                workspaceData: workspaceMgmt
            }).then().catch(err => console.log(err));

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
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    },
                    match: {
                        active: true
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

            const group: any = await Group.findOne({ _id: groupId })
                .select('group_name _workspace')

            // Find the group and remove it from the database
            const groupDeleted: any = await Group.findByIdAndDelete(groupId);

            // Remove the group from users, and users´ favorite groups
            await User.updateMany({ _groups: groupId }, {
                $pull: { _groups: groupId, 'stats.favorite_groups': groupId, 'stats.groups': { $elemMatch: { '_group': groupId }}}
            });

            // Delete Posts and Files too
            const posts = await Post.find({ _group: groupId });
            posts.forEach(post => {
                http.delete(`${process.env.POST_SERVER_API}/${post._id}`)
                    .catch(err => {
                        return sendError(res, err, 'Internal Server Error!', 500);
                    }); 
            });

            Notification.deleteMany({ _origin_group: groupId });

            // Delete the columns of the group
            Column.deleteMany({ groupId: groupId });

            // Delete the flows
            Flow.deleteMany({ _group: groupId});

            // Send new workspace to the mgmt portal
            // Obtain the workspace of the group
            const workspace = await Workspace.findOne({ _id: group._workspace });

            // Count all the groups present inside the workspace
            const groupsCount: number = await Group.find({ $and: [
                { group_name: { $ne: 'personal' } },
                { _workspace: group._workspace }
            ]}).countDocuments();

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: group._workspace }
            ] }).countDocuments();

            // Count all the users present inside the workspace
            const guestsCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: group._workspace },
                { role: 'guest'}
            ] }).countDocuments();

            let workspaceMgmt = {
                _id: group._workspace,
                company_name: workspace.company_name,
                workspace_name: workspace.workspace_name,
                owner_email: workspace.owner_email,
                owner_first_name: workspace.owner_first_name,
                owner_last_name: workspace.owner_last_name,
                _owner_remote_id: workspace._owner._id || workspace._owner,
                environment: process.env.DOMAIN,
                num_members: usersCount,
                num_invited_users: guestsCount,
                num_groups: groupsCount,
                created_date: workspace.created_date,
                access_code: workspace.access_code,
                management_private_api_key: workspace.management_private_api_key
            }
            axios.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                API_KEY: workspace.management_private_api_key,
                workspaceData: workspaceMgmt
            }).then().catch(err => console.log(err));

            // Send the status 200 response
            return res.status(200).json({
                message: 'Group deleted successfully!',
                group: group
            });
        } catch (error) {
            return sendError(res, error);
        }
    };

    /**
     * This function archive the group in the database to the corresponding @constant groupId
     * @param req - @constant groupId
     * @param res 
     */
    async archive(req: Request, res: Response) {

        const { groupId } = req.params;
        const { archive } = req.body;

        try {

            const group: any = await Group.findOneAndUpdate(
                { _id: groupId },
                { archived_group: archive })
                .lean();

            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, invalid groupId!', 404);
            }

            // Remove the group from users favorite groups
            await User.updateMany({ _groups: groupId }, {
                $pull: { 'stats.favorite_groups': groupId, 'stats.groups': { $elemMatch: { '_group': groupId }}}
            });

            // Send the status 200 response
            return res.status(200).json({
                message: `Group archived set to ${archive} successfully!`,
                group: group
            });
        } catch (error) {
            return sendError(res, error);
        }
    };

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
    };


    /**
     * This function is used to get first 10 agora groups not joined by a user
     * @param req \
     * @param res 
     * @param next 
     */
    async getAgoraGroupsNotJoined(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId, userId } = req.query;

            if (!workspaceId || !userId) {
                return res.status(400).json({
                    message: 'Please provide both workspaceId and userId as the query parameter!'
                })
            }

            const agoraGroups = await Group.find({
                $and: [
                    { _members: { $ne: userId } },
                    { _admins: { $ne: userId } },
                    { _workspace: workspaceId },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]},
                    { type: "agora" },
                ]
            })
                .sort('_id')
                // .limit(10)
                .populate({
                    path: '_members',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
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
    };


    /**
     * This function is used to add user to an agora group
     * @param req 
     * @param res 
     * @param next 
     */
    async joinAgoraGroup(req: Request, res: Response, next: NextFunction) {
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
            }, {
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

            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/join-group`, {
                userId: userId,
                groupId: group._id,
                added_by: userId
            });

            return res.status(200).json({
                message: `User added to group successfully!`,
            });

        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };


    /**
     * This function is used to get next 5 not joined agoras
     * @param req 
     * @param res 
     * @param next 
     */
    async getNextAgoraGroupsNotJoined(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId, userId, lastGroupId } = req.query;

            if (!workspaceId || !userId) {
                return res.status(400).json({
                    message: 'Please provide both workspaceId and userId as the query parameter!'
                })
            }

            const agoraGroups = await Group.find({
                $and: [
                    { _members: { $ne: userId } },
                    { _admins: { $ne: userId } },
                    { _workspace: workspaceId },
                    { type: "agora" },
                    { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]},
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
                    },
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: '_id',
                    options: {
                        count: true
                    },
                    match: {
                        active: true
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
    };

    /**
     * This function is responsible for adding a new custom field for the particular group
     * @param { customFiel } req 
     * @param res 
     */
    async addCustomField(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the newCustomField from fileHandler middleware
        const newCustomField = req.body['newCustomField'];

        try {

            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                //custom_fields: newCustomField
                $push: { "custom_fields": newCustomField }
            }, {
                new: true
            }).select('custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches the custom fields of the group corresponding to the @constant groupId 
     * @param req - @constant groupId
     */
    async getCustomFields(req: Request, res: Response) {
        try {

            const { groupId } = req.params;

            // Find the Group based on the groupId
            const group = await Group.findOne({
                _id: groupId
            })
                .populate({
                    path: '_members',
                    select: 'custom_fields',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'custom_fields',
                    match: {
                        active: true
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

    async removeCustomField(req: Request, res: Response, next: NextFunction) {
        // Fetch the groupId & fieldId
        const { groupId, fieldId } = req.params;

        try {

            let group = await Group.findById({
                _id: groupId
            }).select('custom_fields').lean();

            const cfIndex = group.custom_fields.findIndex(cf => cf._id == fieldId);
            const cf = (group && group.custom_fields) ? group.custom_fields[cfIndex] : null;

            if (cf) {
                // remove the CF from the table widget
                group = await Group.findByIdAndUpdate({
                        _id: groupId
                    },
                    {
                        $pull: {
                            'custom_fields_table_widget.selectTypeCFs': cf.name,
                            'custom_fields_table_widget.inputTypeCFs': cf.name
                        }
                    }).lean();
                
                // remove the CF from the Columns where it is displayed
                await Column.updateMany({
                        _group: groupId
                    }, {
                        $pull: {
                            'custom_fields_to_show': cf.name,
                            'custom_fields_to_show_kanban': cf.name
                        }
                    }).lean();

                // remove the CF from the Flows where it is used
                const flows = await Flow.find({
                        _group: groupId
                    }).select('_id steps._id steps.trigger steps.action').lean();

                if (flows) {
                    flows.forEach(flow => {
                        if (flow.steps) {
                            flow.steps.forEach(async step => {
                                const triggerIndex = (step && step.trigger) ? step.trigger.findIndex(trigger => trigger.name == 'Custom Field' && trigger.custom_field.name == cf.name) : -1;
                                const actionIndex = (step && step.action) ? step.action.findIndex(action => action.name == 'Custom Field' && action.custom_field.name == cf.name) : -1;
                                if (triggerIndex >= 0 || actionIndex >= 0) {
                                    await Flow.findByIdAndUpdate({
                                            _id: flow._id
                                        }, {
                                            $pull: {
                                                steps: {_id: step._id}
                                            }
                                        });
                                }
                            });
                        }
                    });
                }
                
                /* TODO
                // remove the CF from the Posts where it is used
                await Post.updateMany({
                        _group: groupId
                    }, {
                        $unset: { cf.name: 1 }
                    });
                */
            }

            // Find the group and update their respective group avatar
            group = await Group.findByIdAndUpdate({
                    _id: groupId
                }, {
                    $pull: {
                        custom_fields: {
                            _id: fieldId
                        }
                    }
                }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async addCustomFieldValue(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body['fieldId'];
        const value = req.body['value'];

        try {
            // Find the custom field in a group and add the value
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                $push: { "custom_fields.$[field].values": value }
            }, {
                arrayFilters: [{ "field._id": fieldId }],
                new: true
            }).select('custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async setCustomFieldDisplayKanbanCard(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body['fieldId'];
        const display_in_kanban_card = req.body['display_in_kanban_card'];

        try {
            // Find the custom field in a group and add the value
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                $set: { "custom_fields.$[field].display_in_kanban_card": display_in_kanban_card }
            }, {
                arrayFilters: [{ "field._id": fieldId }],
                new: true
            }).select('custom_fields')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async setCustomFieldColor(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body['fieldId'];
        const color = req.body['color'];

        try {
            // Find the custom field in a group and add the value
            const group = await Group.findByIdAndUpdate({
                    _id: groupId
                }, {
                    $set: { "custom_fields.$[field].badge_color": color }
                }, {
                    arrayFilters: [{ "field._id": fieldId }],
                    new: true
                }).select('custom_fields')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async removeCustomFieldValue(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Find the custom field in a group and remove the value
        const fieldId = req.body['fieldId'];
        const value = req.body['value'];

        try {
            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                $pull: { "custom_fields.$[field].values": value }
            }, {
                arrayFilters: [{ "field._id": fieldId }],
                new: true
            }).select('custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async saveSettings(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the settingsData From the request
        let { body: { settingsData } } = req;

        try {

            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                    _id: groupId
                }, settingsData, {
                    new: true
                })
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
                    }
                }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group settings updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async selectShuttleSection(req: Request, res: Response, next: NextFunction) {
        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the value from fileHandler middleware
        const columnId = req.body['columnId'];

        try {
            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                _shuttle_section: columnId
            }, {
                new: true
            }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group settings updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async updateSmartGroup(req: Request, res: Response, next: NextFunction) {
        const { groupId } = req.params;
        const { type, payload } = req.body;

        try {
            if (type === 'email_domain') {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { 'conditions.email_domains': payload }
                });
            } else if (type === 'job_position') {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { 'conditions.job_positions': payload }
                });
            } else if (type === 'skills') {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { 'conditions.skills': payload }
                });
            } else if (type === 'custom_fields') {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { 'conditions.custom_fields': payload }
                });
            }

            return res.status(200).json({
                message: 'Rule added successfully!'
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * Gets a smart group's settings.
     */
    async getSmartGroupSettings(req: Request, res: Response, next: NextFunction) {
        const { groupId } = req.params;

        try {
            const groupDoc = await Group
                .findById(groupId)
                .select('conditions');

            return res.status(200).json({
                message: 'Rules successfully found!',
                domains: groupDoc['conditions'].email_domains ? groupDoc['conditions'].email_domains : [],
                positions: groupDoc['conditions'].job_positions ? groupDoc['conditions'].job_positions : [],
                skills: groupDoc['conditions'].skills ? groupDoc['conditions'].skills : [],
                custom_fields: groupDoc['conditions'].custom_fields ? groupDoc['conditions'].custom_fields : []
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * Deletes a smart group's rule.
     */
    async deleteSmartGroupRule(req: Request, res: Response, next: NextFunction) {
        const { groupId, rule, customFieldId } = req.params;

        try {
            let group = await Group.findById(groupId).populate({
                path: '_members',
                select: 'email current_position skills profile_custom_fields'
            }).lean();

            if (rule === 'email_domains') {
                group['_members'].map(async (user) => {
                    const email = user['email'];
                    const index = email.indexOf('@');
                    const emailDomain = email.substring(index + 1);

                    if (group.conditions.email_domains && group.conditions.email_domains.includes(emailDomain)) {
                        await User.findByIdAndUpdate(user._id, {
                            $pull: { _groups: groupId }
                        });

                        await Group.findByIdAndUpdate(groupId, {
                            $pull: { _members: user._id.toString() }
                        });

                        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/leave-group`, {
                            userId: user._id,
                            groupId: group._id,
                            removed_by: req['userId']
                        });
                    }
                });

                group = await Group.findByIdAndUpdate(groupId, {
                        $unset: { 'conditions.email_domains': '' }
                    },
                    {
                        new: true
                    }).lean();

            } else if (rule === 'job_positions') {
                
                group['_members'].map(async (user) => {
                    if (group.conditions.job_positions && group.conditions.job_positions.includes(user['current_position'])) {
                        await User.findByIdAndUpdate(user._id, {
                            $pull: { _groups: groupId }
                        });

                        await Group.findByIdAndUpdate(groupId, {
                            $pull: { _members: user._id.toString() }
                        });

                        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/leave-group`, {
                            userId: user._id,
                            groupId: group._id,
                            removed_by: req['userId']
                        });
                    }
                });

                await Group.findByIdAndUpdate(groupId, {
                        $unset: { 'conditions.job_positions': '' }
                    },
                    {
                        new: true
                    });
            } else if (rule === 'skills') {
                
                group['_members'].map(async (user) => {
                    if (group.conditions.skills && group.conditions.skills.some(skill => user.skills.includes(skill))) {
                        await User.findByIdAndUpdate(user._id, {
                            $pull: { _groups: groupId }
                        });

                        await Group.findByIdAndUpdate(groupId, {
                            $pull: { _members: user._id.toString() }
                        });

                        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/leave-group`, {
                            userId: user._id,
                            groupId: group._id,
                            removed_by: req['userId']
                        });
                    }
                });

                await Group.findByIdAndUpdate(groupId, {
                        $unset: { 'conditions.skills': '' }
                    },
                    {
                        new: true
                    });
            } else if (rule === 'custom_field' && customFieldId) {
                
                group['_members'].map(async (user) => {
                    if (group.conditions.custom_fields
                            && user.profile_custom_fields
                            && group.conditions.custom_fields.some(cf => user.profile_custom_fields[cf.name] == cf.value)) {
                        await User.findByIdAndUpdate(user._id, {
                            $pull: { _groups: groupId }
                        });

                        await Group.findByIdAndUpdate(groupId, {
                            $pull: { _members: user._id.toString() }
                        });

                        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/leave-group`, {
                            userId: user._id,
                            groupId: group._id,
                            removed_by: req['userId']
                        });
                    }
                });

                // Find the workspace and remove a respective custom field
                await Group.findByIdAndUpdate({
                        _id: groupId
                    },
                    {
                        $pull:
                        {
                            'conditions.custom_fields': {
                                _id: customFieldId
                            }
                        }
                    },
                   {
                       new: true
                   }).lean();
            }
            
            group = await Group.findById(groupId)
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .lean();

            return res.status(200).json({
                message: 'Rule successfully deleted!',
                group: group
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * This method is responsible for the automatic
     * addition and deletion of smart group members
     * based on the provided rules.
     */
    async updateSmartGroupMembers(req: Request, res: Response, next: NextFunction) {
        const { groupId } = req.params;
        const { workspaceId } = req.body;

        try {
            // Get Group condition rules
            const groupDoc = await Group
                .findById(groupId)
                .select('conditions');
            
            const emailDomains = groupDoc['conditions'].email_domains ? groupDoc['conditions'].email_domains : [];
            const jobPositions = groupDoc['conditions'].job_positions ? groupDoc['conditions'].job_positions : [];
            const skills = groupDoc['conditions'].skills ? groupDoc['conditions'].skills : [];
            const customFields = groupDoc['conditions'].custom_fields ? groupDoc['conditions'].custom_fields : [];

            // Get users in the group's workspace
            const users = await User.find({
                _workspace: workspaceId,
                active: true
            });

            const validUsers = new Set();
            if (emailDomains.length > 0) {
                // Filter users by email domain
                users.map((user) => {
                    const email = user['email'];
                    const index = email.indexOf('@');
                    const emailDomain = email.substring(index + 1);

                    if (emailDomains.includes(emailDomain) && !validUsers.has(user._id.toString())) {
                        validUsers.add(user._id.toString());
                    }
                });
            }

            if (jobPositions.length > 0) {
                // Filter users by job positions
                users.map((user) => {
                    if (jobPositions.includes(user['current_position']) && !validUsers.has(user._id.toString())) {
                        validUsers.add(user._id.toString());
                    }
                });
            }

            if (skills.length > 0) {
                // Filter users by skills
                users.map((user) => {
                    if (user['skills'].some(skill => skills.includes(skill)) && !validUsers.has(user._id.toString())) {
                        validUsers.add(user._id.toString());
                    }
                });
            }

            if (customFields.length > 0) {
                // Filter users by customFields
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    for (let j = 0; j < customFields.length; j++) {
                        const cf = customFields[j];
                        if (user && user.profile_custom_fields
                                && user.profile_custom_fields.has(cf.name)
                                && user.profile_custom_fields.get(cf.name) == cf.value) {
                            validUsers.add(user._id.toString());
                        }
                    }
                }
            }

            let group = await Group.findById(groupId);

            if (group.group_name.toLowerCase() != 'global') {
                // Remove owner/admin from prospective members
                group['_admins'].map((adminId) => {
                    if (validUsers.has(adminId.toString())) {
                        validUsers.delete(adminId.toString());
                    }
                });
                /*
                // Remove the group from the current members' _groups set
                group['_members'].map(async (userId) => {
                    await User.findByIdAndUpdate(userId, {
                        $pull: { _groups: groupId }
                    });
                });

                // Remove the current members from the group
                await Group.findByIdAndUpdate(groupId, {
                    $set: { _members: [] }
                });
                */
                if (emailDomains.length > 0 || jobPositions.length > 0 || skills.length > 0 || customFields.length > 0) {

                    // Fetch the adminData for mailing
                    const adminData = await User.findOne({
                            _id: req['userId']
                        }).select('first_name email');
        
                    const workspace = await Workspace.findOne({
                            _id: group._workspace._id || group._workspace 
                        }).select('management_private_api_key');

                    // Add new members
                    Array.from(validUsers).map(async (userId) => {
                        // Add the user to the group
                        await Group.findByIdAndUpdate(groupId, {
                            $addToSet: { _members: userId }
                        });

                        // Add the group to the user document
                        const user = await User.findByIdAndUpdate(userId, {
                            $addToSet: { _groups: groupId }
                        });

                        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/join-group`, {
                            userId: user._id,
                            groupId: group._id,
                            added_by: req['userId']
                        });

                        // Send join group confirmation email
                        axios.post(`${process.env.MANAGEMENT_URL}/api/mail/group-joined`, {
                            API_KEY: workspace.management_private_api_key,
                            groupData: {
                                group_name: group.group_name,
                                workspace_name: group.workspace_name
                            },
                            memberData: user,
                            adminData: adminData
                        });
                    });
                }
            }

            group = await Group.findById(groupId)
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    options: {
                        limit: 10
                    }
                })
                .lean();

            return res.status(200).json({
                message: 'Group members successfully updated!',
                group: group
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    async addRag(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = req.params.groupId;
            const ragTag = req.body.ragTag;

            let group: any = await Group.findById(groupId);
            let tagExists = false;
            group.rags.forEach(rag => {
                if (rag.rag_tag === ragTag) {
                    tagExists = true;
                }
            })
            if (tagExists) {
                return sendError(res, new Error('Tag already exists'), 'Tag already exists', 404);
            }
            group.rags.push({ rag_tag: ragTag, tag_members: [] });
            await group.save();

            group = await Group.findById(groupId)
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files'
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files'
                })
                .lean();

            return res.status(200).json({
                message: 'Rag tag added successfully!',
                group,
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    async removeRag(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = req.params.groupId;
            const ragTag = req.body.ragTag;
            const group: any = await Group.findById(groupId);
            let tagExists = false;
            group.rags.forEach(rag => {
                if (rag.rag_tag === ragTag) {
                    tagExists = true;
                }
            });
            if (tagExists) {
                const filteredList = group.rags.filter(rag => rag.rag_tag !== ragTag);
                group.rags = filteredList;
                let posts = await Post.updateMany({ _group: group._id }, {
                    $pull: {
                        rags: { rag_tag: ragTag }
                    }
                }
                );
                group.save();
                res.status(200).json({
                    group
                });
            }
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    async getRags(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = req.params.groupId;
            const group: any = await Group.findById(groupId);
            const rags = group.rags;
            return res.status(200).json({
                message: 'Fetched Rags!',
                rags
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the groups which exist in the database based on the list of @workspaceId
     * @param req 
     * @param res 
     */
    async getWorkspaceGroups(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.query;

            // If workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide the workspaceId as the query parameter!'
                })
            }

            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } },
                    { _workspace: workspaceId, },
                ]
            })
                .sort('_id')
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

    async updateStatus(req: Request, res: Response, next: NextFunction) {

        try {
            const { groupId, status } = req.body;

            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate(groupId, {
                $set: {
                    project_status: status
                },
                $push: {
                    "records.status": {
                        date: moment().format(),
                        project_status: status
                    }
                }
            }, {
                new: true
            });

            // Send status 200 response
            return res.status(200).json({
                message: 'Group settings updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches the number of posts of the group corresponding to the @constant groupId 
     * @param req - @constant groupId
     */
    async getPostsCount(req: Request, res: Response) {
        try {

            const { groupId } = req.params;
            const { query: { period } } = req;

            const comparingDate = moment().local().subtract(+period, 'days').format('YYYY-MM-DD');

            // Find the Group based on the groupId
            const numPosts = await Post.find({
                $and: [
                    { _group: groupId },
                    { created_date: { $gte: comparingDate } }
                ]
            }).countDocuments();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Posts found!',
                numPosts: numPosts
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the posts of the group with specific dates
     * @param req
     */
    async getTasksBetweenDates(req: Request, res: Response) {
        try {

            const { groupId } = req.params;
            const { query: { startDate, endDate } } = req;

            // Find the Group based on the groupId
            const posts = await Post.find({
                $and: [
                    { _group: groupId },
                    { type: 'task' },
                    { 'task.due_to': { $gte: startDate, $lte: endDate} }
                ]
            })
            .select('task.status task.due_to _assigned_to task.allocation')
            .lean() || [];

            // Send the status 200 response
            return res.status(200).json({
                message: 'Posts found!',
                posts: posts
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * Save the widgets selected for the group.
     */
    async saveSelectedWidgets(req: Request, res: Response, next: NextFunction) {
        const { groupId } = req.params;
        const { selectedWidgets } = req.body;

        try {

            if (!selectedWidgets.includes('RESOURCE_MANAGEMENT')) {
                await Group.findByIdAndUpdate(groupId, {
                    resource_management_allocation: false
                }).select('selected_widgets').lean();
            }

            const group = await Group.findByIdAndUpdate(groupId, {
                $set: { 'selected_widgets': selectedWidgets }
            })
            .populate({
                path: '_members',
                select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                match: {
                    active: true
                }
            })
            .populate({
                path: '_admins',
                select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                match: {
                    active: true
                }
            }).lean();

            return res.status(200).json({
                message: 'Group updated!',
                group: group
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches the posts of the group with specific dates
     * @param req
     */
    async getShuttleTasks(req: Request, res: Response) {
        try {

            const { groupId } = req.params;

            // Find the Group based on the groupId
            const posts = await Post.find({
                $and: [
                    { type: 'task' },
                    { 'task.shuttle_type': true },
                    { 'task.shuttles._shuttle_group': groupId }
                ]
            })
            .populate({ path: '_group', select: 'group_name group_avatar workspace_name' })
            .populate({ path: '_posted_by', select: 'first_name last_name profile_pic role email' })
            .populate({ path: '_assigned_to', select: 'first_name last_name profile_pic role email' })
            .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
            .populate({ path: '_followers', select: 'first_name last_name profile_pic role email' })
            .populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar shuttle_type _shuttle_section' })
            .populate({ path: 'task.shuttles._shuttle_section', select: '_id title' })
            .lean() || [];

            // Send the status 200 response
            return res.status(200).json({
                message: 'Posts found!',
                posts: posts
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for fetching the list active groups based on the workspaceId and query
     * @param { params: { groupId }, query: { query } }req 
     * @param res 
     * @param next 
     */
    async getWorkspaceActiveGroups(req: Request, res: Response, next: NextFunction) {

        const { query: { workspaceId, query } } = req;

        try {

            // If either workspaceId is null or not provided then we throw BAD REQUEST
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current group
            const groups = await Group.find({
                    $and: [
                        { group_name: { $ne: 'personal' } },
                        { group_name: { $regex: new RegExp(query.toString(), 'i') } },
                        { _workspace: workspaceId },
                        { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
                    ]
                })
                .sort('_id')
                .lean() || []

            // Send the status 200 response
            return res.status(200).json({
                message: `${groups.length} active groups found!`,
                groups: groups
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for fetching the list archived groups based on the workspaceId and query
     * @param { params: { groupId }, query: { query } }req 
     * @param res 
     * @param next 
     */
    async getWorkspaceArchivedGroups(req: Request, res: Response, next: NextFunction) {

        const { query: { workspaceId, query } } = req;

        try {

            // If either groupId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current group
            const groups = await Group.find({
                    $and: [
                        { group_name: { $ne: 'personal' } },
                        { group_name: { $regex: new RegExp(query.toString(), 'i') } },
                        { _workspace: workspaceId },
                        { archived_group: true }
                    ]
                })
                .sort('_id')
                .lean() || []

            // Send the status 200 response
            return res.status(200).json({
                message: `${groups.length} archived groups found!`,
                groups: groups
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async saveCustomFieldsSettings(req: Request, res: Response, next: NextFunction) {
        const { groupId } = req.params;
        const { settings } = req.body;

        try {

            const group = await Group.findByIdAndUpdate(groupId, {
                $set: { 'custom_fields_table_widget': settings }
            })
            .populate({
                path: '_members',
                select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                match: {
                    active: true
                }
            })
            .populate({
                path: '_admins',
                select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                match: {
                    active: true
                }
            }).lean();

            return res.status(200).json({
                message: 'Group updated!',
                group: group
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };
}
