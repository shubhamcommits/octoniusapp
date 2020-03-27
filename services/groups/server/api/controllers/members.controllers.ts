import { sendError } from '../../utils';
import { User, Group } from '../models';
import { Request, Response, NextFunction } from 'express';
import http from 'axios';

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
                            { full_name: { $regex: new RegExp(query, 'i') } },
                            { email: { $regex: new RegExp(query, 'i') } }
                        ]
                    },
                    { _groups: groupId },
                    { active: true }
                ]
            })
                .sort('_id')
                .limit(10)
                .select('first_name last_name email role profile_pic created_date')
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
                            { full_name: { $regex: new RegExp(query, 'i') } },
                            { email: { $regex: new RegExp(query, 'i') } }
                        ]
                    },
                    { _id: { $gt: lastUserId } },
                    { _groups: groupId },
                    { active: true },
                ]
            })
                .sort('_id')
                .limit(5)
                .select('first_name last_name email role profile_pic created_date')
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
                        }
                    })
                    .populate({
                        path: '_admins',
                        select: 'first_name last_name profile_pic role email',
                        options: {
                            limit: 10
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
                        }
                    })
                    .populate({
                        path: '_admins',
                        select: 'first_name last_name profile_pic role email',
                        options: {
                            limit: 10
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
            })

            // Fetch the adminData for mailing
            const adminData = await User.findOne({
                _id: adminId
            }).select('first_name email')

            // Send join group confirmation email using mailing microservice
            await http.post('http://localhost:2000/api/mails/group-joined', {
                groupData: {
                    group_name: groupData.group_name,
                    workspace_name: groupData.workspace_name
                },
                memberData: member,
                adminData: adminData
            })

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
                $pull: { _members: userId, _admins: userId },
                $inc: { members_count: -1 }
            }, {
                new: true
            })

            // Remove groupId from user groups
            let userUpdate = await User.findOneAndUpdate({
                _id: userId
            }, {
                $pull: { _groups: groupId }
            }, {
                new: true
            });

            // If group wasn't found or user wasn't found return invalid id error
            if (!groupUpdate || !userUpdate) {
                let msg = '';
                groupUpdate ? msg = 'Group' : msg = 'User';
                return sendError(res, new Error(`${msg} not found, invalid Id!`), `${msg} not found, invalid Id!`, 404)
            }

            // Send status 200 response
            return res.status(200).json({
                message: `User has been removed from ${groupUpdate.group_name} group.`
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

}