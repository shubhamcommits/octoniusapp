import { sendError } from '../../utils';
import { User } from '../models';
import { Request, Response, NextFunction } from 'express';

export class MembersControllers {

    /**
     * Helper Function for fetching the users from the database based on the workspaceId
     * @param workspaceId 
     * @param query 
     * @param groupId 
     */
    async fetchUsers(workspaceId: string, query: string, groupId?: string) {
        return await User.find({
            $and: [
                {
                    $or: [
                        { full_name: { $regex: new RegExp(query, 'i') } },
                        { email: { $regex: new RegExp(query, 'i') } }
                    ]
                },
                { _workspace: workspaceId },
                { _groups: { $nin: groupId } },
                { active: true }
            ]
        })
            .sort('_id')
            .limit(10)
            .select('first_name last_name email role profile_pic')
            .lean() || []
    }

    /**
     * This function is responsible for fetching the list of first 10 workspace members based on the workspace also not their in a particular group and query(optional parameter)
     * @param { params: { workspaceId }, query: { query } }req 
     * @param res 
     * @param next 
     */
    async membersNotInGroup(req: Request, res: Response, next: NextFunction){

        const { query: { workspaceId, query, groupId } } = req;

        try {

            // If either workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current workspace and not inside a particular group
            const users = await new MembersControllers().fetchUsers(workspaceId, query, groupId)

            // Send the status 200 response
            return res.status(200).json({
                message: `The First ${users.length} workspace members found!`,
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
    async getWorkspaceMembers(req: Request, res: Response, next: NextFunction) {

        const { query: { workspaceId, query } } = req;

        try {

            // If either workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current workspace
            const users = await new MembersControllers().fetchUsers(workspaceId, query)

            // Send the status 200 response
            return res.status(200).json({
                message: `The First ${users.length} workspace members found!`,
                users: users
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of next 5 workspace members based on the workspace, lastUserId and query(optional parameter)
     * @param { params: { workspaceId }, query: { query, lastUserId } } = req
     * @param res 
     * @param next 
     */
    async getNextWorkspaceMembers(req: Request, res: Response, next: NextFunction) {

        const { query: { workspaceId, query, lastUserId } } = req;

        try {

            // If either workspaceId or lastUserId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId || !lastUserId) {
                return res.status(400).json({
                    message: 'Please provide workspaceI and lastUserId as the query parameter!'
                })
            }

            // Find the users based on the regex expression matched with either full_name or email property present in the current workspace
            const users = await User.find({
                $and: [
                    {
                        $or: [
                            { full_name: { $regex: new RegExp(query, 'i') } },
                            { email: { $regex: new RegExp(query, 'i') } }
                        ]
                    },
                    { _id: { $gt: lastUserId } },
                    { _workspace: workspaceId },
                    { active: true },
                ]
            })
                .sort('_id')
                .limit(5)
                .select('first_name last_name email role profile_pic')
                .lean() || []

            // Send the status 200 response
            return res.status(200).json({
                message: `The next ${users.length} workspace members found !`,
                users: users
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}