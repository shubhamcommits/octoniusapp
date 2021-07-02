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

            // Fetch first 10 groups in the database which are not private
            const groups = await Group.find({
                $and: [
                    { group_name: { $ne: 'personal' } },
                    { group_name: { $ne: 'private' } }]
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
                .limit(20)
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
                $pull: { _groups: groupId, 'stats.favorite_groups': groupId, 'stats.groups': {'_group': groupId}}
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
            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            },
                {
                    $pull:
                    {
                        custom_fields: {
                            _id: fieldId
                        }
                    }
                });

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

    async saveShareFilesSettings(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the value from fileHandler middleware
        const value = req.body['value'];

        try {

            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                share_files: value
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

    async enableRights(req: Request, res: Response, next: NextFunction) {
        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the value from fileHandler middleware
        const value = req.body['value'];

        try {

            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                enabled_rights: value
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

    async enabledProjectType(req: Request, res: Response, next: NextFunction) {
        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the value from fileHandler middleware
        const value = req.body['value'];

        try {
            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                project_type: value
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

    async enabledShuttleType(req: Request, res: Response, next: NextFunction) {
        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the value from fileHandler middleware
        const value = req.body['value'];

        try {
            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                shuttle_type: value
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
            if (rule === 'email_domains') {
                await Group.findByIdAndUpdate(groupId, {
                    $unset: { 'conditions.email_domains': '' }
                });
            } else if (rule === 'job_positions') {
                await Group.findByIdAndUpdate(groupId, {
                    $unset: { 'conditions.job_positions': '' }
                });
            } else if (rule === 'skills') {
                await Group.findByIdAndUpdate(groupId, {
                    $unset: { 'conditions.skills': '' }
                });
            } else if (rule === 'custom_field' && customFieldId) {
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
                   } ).lean();
            }

            return res.status(200).json({
                message: 'Rule successfully deleted!'
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

                if (emailDomains.length > 0 || jobPositions.length > 0 || skills.length > 0 || customFields.length > 0) {
                    // Add new members
                    Array.from(validUsers).map(async (userId) => {
                        // Add the user to the group
                        await Group.findByIdAndUpdate(groupId, {
                            $addToSet: { _members: userId }
                        });

                        // Add the group to the user document
                        await User.findByIdAndUpdate(userId, {
                            $addToSet: { _groups: groupId }
                        });
                    });
                }
            }

            group = await Group.findById(groupId).lean();

            return res.status(200).json({
                message: 'Group members successfully updated!',
                group: group
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    async addBar(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = req.params.groupId;
            const barTag = req.body.barTag;

            const group: any = await Group.findById(groupId);
            let tagExists = false;
            group.bars.forEach(bar => {
                if (bar.bar_tag === barTag) {
                    tagExists = true;
                }
            })
            if (tagExists) {
                return sendError(res, new Error('Tag already exists'), 'Tag already exists', 404);
            }
            group.bars.push({ bar_tag: barTag, tag_members: [] });
            await group.save();
            return res.status(200).json({
                message: 'Bar tag added successfully!',
                group,
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    async removeBar(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = req.params.groupId;
            const barTag = req.body.barTag;
            const group: any = await Group.findById(groupId);
            let tagExists = false;
            group.bars.forEach(bar => {
                if (bar.bar_tag === barTag) {
                    tagExists = true;
                }
            });
            if (tagExists) {
                const filteredList = group.bars.filter(bar => bar.bar_tag !== barTag);
                group.bars = filteredList;
                let posts = await Post.updateMany({ _group: group._id }, {
                    $pull: {
                        bars: { bar_tag: barTag }
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

    async getBars(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = req.params.groupId;
            const group: any = await Group.findById(groupId);
            const bars = group.bars;
            return res.status(200).json({
                message: 'Fetched Bars!',
                bars
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
            const group = await Group.findByIdAndUpdate(groupId, {
                $set: { 'selected_widgets': selectedWidgets }
            }).select('selected_widgets').lean();

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
                    { 'task._shuttle_group': groupId }
                ]
            })
            .populate({ path: '_group', select: 'group_name group_avatar workspace_name' })
            .populate({ path: '_posted_by', select: 'first_name last_name profile_pic role email' })
            .populate({ path: '_assigned_to', select: 'first_name last_name profile_pic role email' })
            .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
            .populate({ path: '_followers', select: 'first_name last_name profile_pic role email' })
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
}
