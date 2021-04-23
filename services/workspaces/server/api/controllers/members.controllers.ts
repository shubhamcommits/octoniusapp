import { sendError } from '../../utils';
import { User, Workspace, Group, Account } from '../models';
import { Request, Response, NextFunction } from 'express';
import http from 'axios';

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
                _id: userId
            }, {
                active: true,
                invited: false,
            }, {
                new: true
            }).select('first_name last_name profile_pic active email role integrations').lean();

            await Account.findOneAndUpdate({
                email: user.email
            }, {
                $push: {
                    _workspaces: workspaceId
                }
            });

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
            }).select('email first_name last_name profile_pic email role integrations')
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });

            // Remove the workplaces from the accounts with the workplace
            await Account.findByIdAndUpdate({
                _id: user._account._id
            }, {
                $pull: {
                    _workspaces: workspaceId
                }
            });

            // User found
            if (user) {
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

                // Send workspace to the mgmt portal
                if (process.env.NODE_ENV == 'production') {

                    // Count all the users present inside the workspace
                    const guestsCount: number = await User.find({ $and: [
                        { active: true },
                        { _workspace: workspaceId },
                        { role: 'guest'}
                    ] }).countDocuments();

                    // Count all the groups present inside the workspace
                    const groupsCount: number = await Group.find({ $and: [
                        { group_name: { $ne: 'personal' } },
                        { _workspace: workspace._id }
                    ]}).countDocuments();

                    let workspaceMgmt = {
                        _id: workspace._id,
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
                        billing: {
                            subscription_id: (workspace.billing) ? workspace.billing.subscription_id : '',
                            current_period_end: (workspace.billing) ? workspace.billing.current_period_end : '',
                            scheduled_cancellation: (workspace.billing) ? workspace.billing.scheduled_cancellation : false,
                            quantity: usersCount
                        }
                    }
                    http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                        API_KEY: process.env.MANAGEMENT_API_KEY,
                        workspaceData: workspaceMgmt
                    }).then().catch(err => console.log(err));

                    // Send user to the mgmt portal
                    let userMgmt = {
                        _id: user._id,
                        _account_id: user._account._id,
                        active: user.active,
                        email: user._account.email,
                        password: user._account.password,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        _remote_workspace_id: workspace._id,
                        workspace_name: workspace.workspace_name,
                        environment: process.env.DOMAIN,
                        created_date: user.created_date
                    }
                    http.post(`${process.env.MANAGEMENT_URL}/api/user/add`, {
                        API_KEY: process.env.MANAGEMENT_API_KEY,
                        userData: userMgmt
                    }).then().catch(err => console.log(err));
                }
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