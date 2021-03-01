import { sendError } from '../../utils';
import { User, Workspace, Group } from '../models';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

// Create Stripe Object
const stripe = require('stripe')(process.env.SK_STRIPE);

export class MembersControllers {

    /**
     * Helper Function for fetching the users from the database based on the workspaceId
     * @param workspaceId 
     * @param query 
     * @param groupId 
     */
    async fetchUsers(workspaceId: any, query: any, groupId?: any) {
        return await User.find({
            $and: [
                {
                    $or: [
                        { full_name: { $regex: new RegExp(query, 'i') } },
                        { email: { $regex: new RegExp(query, 'i') } }
                    ]
                },
                { _workspace: workspaceId },
                { _groups: { $nin: groupId } }
            ]
        })
            .sort('_id')
            //.limit(10)
            .select('first_name last_name email role profile_pic active integrations')
            .lean() || []
    }

    /**
     * This function is responsible for fetching the list of first 10 workspace members based on the workspace also not their in a particular group and query(optional parameter)
     * @param { params: { workspaceId }, query: { query } }req 
     * @param res 
     * @param next 
     */
    async membersNotInGroup(req: Request, res: Response, next: NextFunction) {

        // let { query: { workspaceId, groupId } } = req;

        // Fetch the variables from request
        let workspaceId: any = req.query.workspaceId
        let query: any = req.query.query
        let groupId: any = req.query.groupId

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

        // let { query: { workspaceId } } = req;

        // Fetch the variables from request
        let workspaceId: any = req.query.workspaceId
        let query: any = req.query.query

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

        // let { query: { workspaceId, lastUserId } } = req;

        // Fetch the variables from request
        let workspaceId: any = req.query.workspaceId
        let query: any = req.query.query
        let lastUserId: any = req.query.lastUserId

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
                    { _workspace: workspaceId }
                ]
            })
                .sort('_id')
                .limit(5)
                .select('first_name last_name email role profile_pic active integrations')
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

    async reactivateUserInWorkplace(req: Request, res: Response, next: NextFunction) {
        const { userId, workspaceId } = req.body;
        try {
            const user: any = await User.findOneAndUpdate({
                $and: [
                    { _id: userId },
                    // { active: false },
                    // { workspace: workspaceId },
                ]
            }, {
                active: true,
                invited: false,
            }, {
                new: true
            }).select('first_name last_name profile_pic active email role integrations');

            const workspace = await Workspace.findById(workspaceId);

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();
            
           // Update the subscription details
           let subscription = stripe.subscriptionItems.update(workspace['billing'].subscription_item_id, {
                quantity: usersCount
            });

            // Update the workspace details
            await Workspace.findOneAndUpdate({
                _id: workspaceId
            }, {
                'billing.quantity': usersCount
            });

            // Send status 200 response
            return res.status(200).json({
                message: `Activated user ${user.first_name}`,
                user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
    * This function is responsible for removing the user from workspace
    * @param req 
    * @param res 
    * @param next 
    */
    async removeUserFromWorkplace(req: Request, res: Response, next: NextFunction) {

        const { userId, workspaceId } = req.body;

        try {
            // Find the user and delete them
            const user: any = await User.findOneAndUpdate({
                $and: [
                    { _id: userId },
                    { active: true },
                    { _workspace: workspaceId }
                ]
            }, {
                active: false,
                invited: false
            }, {
                new: true
            }).select('first_name last_name profile_pic email role integrations');

            // User found
            if (user) {
                // TODO Check if this part is needed
                // Remove from workspace
                // const workspace = await Workspace.findByIdAndUpdate(workspaceId, {
                //     $pull: { "invited_users._user": userId, "members": userId },
                // }, { new: true });
                const workspace = await Workspace.findById(workspaceId);

                // Count all the users present inside the workspace
                const usersCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspaceId }
                ] }).countDocuments();

                // Update the subscription details
                let subscription = stripe.subscriptionItems.update(workspace['billing'].subscription_item_id, {
                    quantity: usersCount
                });

                // Update the workspace details
                await Workspace.findOneAndUpdate({
                    _id: workspaceId
                }, {
                    'billing.quantity': usersCount
                });
            } else {
                return sendError(res, new Error("No Such User"), 'No Such User!', 400);
            }

            // Send status 200 response
            return res.status(200).json({
                message: `Removed user ${user.first_name}`,
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of first 10 workspace members based on the workspace and query(optional parameter)
     * @param { params: { workspaceId, period } }req 
     * @param res 
     * @param next 
     */
    async getWorkspaceUsers(req: Request, res: Response, next: NextFunction) {

        // Fetch the variables from request
        let {workspaceId} = req.query;
        
        try {

            // If either workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            // Find the users present in the current workspace
            const users = await User.find(
                { _workspace: workspaceId }).lean() || []

            // Send the status 200 response
            return res.status(200).json({
                message: `The First ${users.length} workspace members found!`,
                users: users
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}