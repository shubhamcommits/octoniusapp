import { axios, sendError } from '../../utils';
import { User, Group, Workspace, Post, Comment } from '../models';
import { Request, Response, NextFunction } from 'express';
import http from 'axios';
import moment from 'moment';

export class MembersControllers {

    /**
     * This function is responsible for fetching the list of first 10 group members based on the groupId and query(optional parameter)
     * @param { params: { groupId }, query: { query } }req 
     * @param res 
     * @param next 
     */
    async getGroupMembers(req: Request, res: Response, next: NextFunction) {

        const { query: { groupId, query } } = req;

        try {

            // If either groupId is null or not provided then we throw BAD REQUEST 
            if (!groupId) {
                return res.status(400).json({
                    message: 'Please provide groupId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current group
            const users = await User.find({
                $and: [
                    {
                        $or: [
                            { full_name: { $regex: new RegExp(query.toString(), 'i') } },
                            { email: { $regex: new RegExp(query.toString(), 'i') } }
                        ]
                    },
                    { _groups: groupId },
                    { active: true }
                ]
            })
                .sort('_id')
                .limit(10)
                .select('first_name last_name email active role profile_pic created_date integrations')
                .lean() || []

            // Send the status 200 response
            return res.status(200).json({
                message: `The First ${users.length} group members found!`,
                users: users
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of next 5 group members based on the group, lastUserId and query(optional parameter)
     * @param { params: { groupId }, query: { query, lastUserId } } = req
     * @param res 
     * @param next 
     */
    async getNextGroupMembers(req: Request, res: Response, next: NextFunction) {

        const { query: { groupId, query, lastUserId } } = req;

        try {

            // If either groupId or lastUserId is null or not provided then we throw BAD REQUEST 
            if (!groupId || !lastUserId) {
                return res.status(400).json({
                    message: 'Please provide groupId and lastUserId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current group
            const users = await User.find({
                $and: [
                    {
                        $or: [
                            { full_name: { $regex: new RegExp(query.toString(), 'i') } },
                            { email: { $regex: new RegExp(query.toString(), 'i') } }
                        ]
                    },
                    { _id: { $gt: lastUserId } },
                    { _groups: groupId },
                    { active: true },
                ]
            })
                .sort('_id')
                .limit(5)
                .select('first_name last_name email active role profile_pic created_date integrations')
                .lean() || []

            // Send the status 200 response
            return res.status(200).json({
                message: `The next ${users.length} group members found !`,
                users: users
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of group members based on the groupId
     * @param { params: { groupId } }req 
     * @param res 
     * @param next 
     */
    async getAllGroupMembers(req: Request, res: Response, next: NextFunction) {

        const { query: { groupId } } = req;

        try {

            // If either groupId is null or not provided then we throw BAD REQUEST 
            if (!groupId) {
                return res.status(400).json({
                    message: 'Please provide groupId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current group
            const users = await User.find({
                    $and: [
                        { _groups: groupId },
                        { active: true }
                    ]
                })
                .sort('_id')
                .select('first_name last_name full_name email current_position active role profile_pic created_date out_of_office integrations')
                .lean() || []

            // Send the status 200 response
            return res.status(200).json({
                message: `The First ${users.length} group members found!`,
                users: users
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of first 10 workspace members based on the workspace and query(optional parameter)
     * @param { params: { workspaceId }, query: { query } }req 
     * @param res 
     * @param next 
     */
    async getGroupMembersSocialStats(req: Request, res: Response, next: NextFunction) {

        // Fetch the variables from request
        let groupId: any = req.query.groupId
        let numDays: any = req.query.numDays

        try {

            // If either workspaceId is null or not provided then we throw BAD REQUEST 
            if (!groupId) {
                return res.status(400).json({
                    message: 'Please provide groupId as the query parameter!'
                })
            }

            numDays = +numDays;

            const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');
            const today = moment().subtract(1, 'days').endOf('day').format();

            let retUsers = [];
            const users = await User.find({
                    $and: [
                        { _groups: groupId },
                        { active: true }
                    ]
                })
                .sort('_id')
                .select('first_name last_name email role profile_pic active integrations current_position')
                .lean() || [];

            const posts = await Post.find({
                    $and: [
                        { _group: groupId },
                        { created_date: { $gte: comparingDate, $lt: today } }
                    ]
                }).select('_id').lean();

            const postsIds = posts.map(post => post._id);

            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                user.numPosts = await Post.find({
                        $and: [
                            { type: { $ne: 'task' } },
                            { _group: groupId },
                            { created_date: { $gte: comparingDate, $lt: today } },
                            { _posted_by: user?._id }
                        ]
                    }).countDocuments();

                user.numTasks = await Post.find({
                        $and: [
                            { type: { $eq: 'task' } },
                            { _group: groupId },
                            { created_date: { $gte: comparingDate, $lt: today } },
                            { _posted_by: user?._id }
                        ]
                    }).countDocuments();

                user.numComments = await Comment.find({
                        $and: [
                            { _post: postsIds },
                            { created_date: { $gte: comparingDate, $lt: today } },
                            { _commented_by: user?._id }
                        ]
                    }).countDocuments();

                const postLiked = await Post.find({
                        $and: [
                            { _group: groupId },
                            { created_date: { $gte: comparingDate, $lt: today } },
                            { _liked_by: user?._id }
                        ]
                    }).countDocuments();

                const commentsLiked = await Post.find({
                        $and: [
                            { _post: { $in: postsIds }},
                            { created_date: { $gte: comparingDate, $lt: today } },
                            { _liked_by: user?._id }
                        ]
                    }).countDocuments();

                user.numLikes = postLiked + commentsLiked;

                user.totalCounts = user.numComments + user.numComments + user.numlikes;

                retUsers.push(user);
            }

            retUsers.sort((u1, u2) => (u1.totalCounts > u2.totalCounts) ? -1 : 1);

            // Send the status 200 response
            return res.status(200).json({
                message: `The workspace members found!`,
                users: await retUsers.slice(0, 5)
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for adding a new user to the group
     * @param { body: { groupId, member: { _id, role, first_name, email  } } }req 
     * @param res 
     * @param next 
     */
    async addNewUserInGroup(req: Request, res: Response, next: NextFunction) {

        // Current UserId
        const adminId = req['userId'];

        // Group and Member details from req.body
        const { groupId, member } = req.body

        try {

            // Map the member into array of Ids
            const _member = member._id

            // Fetch the role of member
            const role = member.role

            // Update the group object
            let groupData: any = {}

            // Update the group _members section and feed the memberId, and also increment the count of members by 1
            if (role === 'member') {
                groupData = await Group.findByIdAndUpdate({
                        _id: groupId
                    }, {
                        $addToSet: {
                            _members: _member
                        },
                        $inc: { members_count: 1 }
                    }, {
                        new: true
                    })
                    .populate({
                        path: '_members',
                        select: 'first_name last_name profile_pic role email',
                        options: {
                            limit: 10
                        },
                        match: {
                            active: true
                        }
                    })
                    .populate({
                        path: '_admins',
                        select: 'first_name last_name profile_pic role email',
                        options: {
                            limit: 10
                        },
                        match: {
                            active: true
                        }
                    })
                    .lean();
            }

            // Update the group _admin section and feed the memberId
            else {

                groupData = await Group.findByIdAndUpdate({
                        _id: groupId
                    }, {
                        $addToSet: {
                            _admins: _member
                        },
                        $inc: { members_count: 1 }
                    }, {
                        new: true
                    })
                    .populate({
                        path: '_members',
                        select: 'first_name last_name profile_pic role email',
                        options: {
                            limit: 10
                        },
                        match: {
                            active: true
                        }
                    })
                    .populate({
                        path: '_admins',
                        select: 'first_name last_name profile_pic role email',
                        options: {
                            limit: 10
                        },
                        match: {
                            active: true
                        }
                    })
                    .lean();
            }


            // Update the userData and push group
            await User.updateMany({
                    _id: _member
                }, {
                    $addToSet: {
                        _groups: groupId
                    }
                }, {
                    multi: true
                });

            // Fetch the adminData for mailing
            const adminData = await User.findOne({
                _id: adminId
            }).select('first_name email');

            const workspace = await Workspace.findOne({
                _id: groupData._workspace._id || groupData._workspace 
            }).select('management_private_api_key');

            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/join-group`, {
                    userId: _member,
                    groupId: groupId,
                    added_by: adminId
                });

            /*
            // Send join group confirmation email
            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/group-joined`, {
                    API_KEY: workspace.management_private_api_key,
                    groupData: {
                        group_name: groupData.group_name,
                        workspace_name: groupData.workspace_name
                    },
                    memberData: member,
                    adminData: adminData
                });
            */

            // Send status 200 response
            return res.status(200).json({
                message: 'New Member has been added to the group!',
                group: groupData
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is responsible for removing a user from the group
     * @param req 
     * @param res 
     * @param next 
     */
    async removeUserFromGroup(req: Request, res: Response, next: NextFunction) {

        // Get the groupId and userId
        const { groupId, userId } = req.body

        try {

            // Remove userId from group users and decrement the count of members
            let groupUpdate: any = await Group.findOneAndUpdate({
                    _id: groupId
                }, {
                    $pull: { _members: userId, _admins: userId},
                    $inc: { members_count: -1 }
                }, {
                    new: true
                });

            // Remove groupId from user groups
            let userUpdate = await User.findOneAndUpdate({
                    _id: userId
                }, {
                    $pull: { _groups: groupId, 'stats.favorite_groups': groupId, 'stats.groups': { $elemMatch: { '_group': groupId }}}
                }, {
                    new: true
                });

            // If group wasn't found or user wasn't found return invalid id error
            if (!groupUpdate || !userUpdate) {
                let msg = '';
                groupUpdate ? msg = 'Group' : msg = 'User';
                return sendError(res, new Error(`${msg} not found, invalid Id!`), `${msg} not found, invalid Id!`, 404)
            }

            // Send Notification
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/leave-group`, {
                userId: userId,
                groupId: groupId,
                removed_by: req['userId']
            });

            // Send status 200 response
            return res.status(200).json({
                message: `User has been removed from ${groupUpdate.group_name} group.`
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * Adding users to Rag
     * Users who can see some private tasks depening on rag
     * @param req 
     * @param res 
     * @param next 
     */
    async addUserToRag(req: Request, res: Response, next: NextFunction) {
        const { groupId, member, ragTag } = req.body;

        try {
            const memberId = member._id;
            let groupUpdate: any = await Group.findById(groupId);
            let foundRag = false;
            let userExists = false;
            let users;
            groupUpdate.rags.forEach(rag => {
                if (rag.rag_tag === ragTag) {
                  foundRag = true;
                }
                if (rag.rag_tag === ragTag && rag._members.includes(memberId)) {
                    userExists = true;
                    users = rag._members;
                }
            });
            // If group wasn't found invalid id error
            if (groupUpdate === null || groupUpdate === undefined) {
                let msg = '';
                groupUpdate ? msg = 'Group' : msg = 'User';
                return sendError(res, new Error(`${msg} not found, invalid Id!`), `${msg} not found, invalid Id!`, 404);
            } else if (!foundRag) {
                return sendError(res, new Error('Rag tag does not exist!'), 'Rag not found!', 404);
            } else if (userExists) {
                return sendError(res, new Error('User already tag member!'), 'Already member!', 404);
            }
            
            groupUpdate.rags.forEach( rag => {
                if (rag.rag_tag === ragTag) {
                    rag._members.push(memberId);
                }
            });
            groupUpdate.save();
            
            groupUpdate = await Group.findById(groupId)
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files'
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files'
                })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'New Member has been added to the rag!',
                group: groupUpdate
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * Removing users from Rag
     * @param req
     * @param res
     * @param next 
     */
    async removeUserFromRag(req: Request, res: Response, next: NextFunction) {
        // Get the groupId and userId
        const { groupId, member, ragTag } = req.body;
        try {
            const memberId = member._id;
            const groupUpdate: any = await Group.findById(groupId);

            // If group wasn't found invalid id error
            if (groupUpdate === null || groupUpdate === undefined) {
                let msg = '';
                groupUpdate ? msg = 'Group' : msg = 'User';
                return sendError(res, new Error(`${msg} not found, invalid Id!`), `${msg} not found, invalid Id!`, 404)
            }
            let usersList;
            // tslint:disable-next-line: no-shadowed-variable
            groupUpdate.rags.forEach( rag => {
                if (rag.rag_tag === ragTag) {
                    usersList = rag._members.filter( tagMember => String(tagMember) !== memberId);
                    rag._members = usersList;
                }
            });
            groupUpdate.save();

            // Send status 200 response
            return res.status(200).json({
                message: `User has been removed from ${ragTag} Rag.`
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
