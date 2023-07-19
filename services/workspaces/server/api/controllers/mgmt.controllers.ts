import { sendError } from '../../utils';
import { Request, Response, NextFunction } from 'express';
import { ManagementService, WorkspaceService } from '../services';
import { Account, Group, User, Workspace } from '../models';
import http from 'axios';

const workspaceService = new WorkspaceService();
const managementService = new ManagementService();

export class ManagementControllers {


    /**
     * This function is responsible for fetching the information of the workspace for the mgmt portal
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
     async getWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { workspaceId } } = req;

            if (!workspaceId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            const workspace = await Workspace.findOne({_id: workspaceId}).lean();

            // Count all the groups present inside the workspace
            const groupsCount: number = await Group.find({ $and: [
                { group_name: { $ne: 'personal' } },
                { _workspace: workspace._id }
            ]}).countDocuments();

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();

            // Count all the users present inside the workspace
            const guestsCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspace._id },
                { role: 'guest'}
            ] }).countDocuments();

            let workspaceMgmt = {
                remote_id: workspace._id,
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

            // Find the user and delete them
            const usersMongo: any = await User.find({
                $and: [
                    { active: true },
                    { _workspace: workspaceId }
                ]
            }).select('first_name last_name active created_date')
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });

            const users: any[] = usersMongo.map(user => ({
                remote_id: user._id,
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
            }));

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace information.',
                workspace: workspaceMgmt,
                users: users
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for updating the workspace name remotely from the mgmt portal
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
    async updateWorkspaceName(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { workspaceId }, body: { workspaceName } } = req;

            if (!workspaceId || !workspaceName) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            const workspace = await workspaceService.updateWorkspaceName(workspaceId.toString(), workspaceName);

            // Count all the groups present inside the workspace
            const groupsCount: number = await Group.find({ $and: [
                { group_name: { $ne: 'personal' } },
                { _workspace: workspace._id }
            ]}).countDocuments();
    
            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();
    
            // Count all the users present inside the workspace
            const guestsCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspace._id },
                { role: 'guest'}
            ] }).countDocuments();
    
            let workspaceMgmt = {
                remote_id: workspace._id,
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
    
            // Find the user and delete them
            const usersMongo: any = await User.find({
                $and: [
                    { active: true },
                    { _workspace: workspaceId }
                ]
            }).select('first_name last_name active created_date')
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });
    
            const users: any[] = usersMongo.map(user => ({
                remote_id: user._id,
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
            }));
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace information.',
                workspace: workspaceMgmt,
                users: users
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for deleting the workspace remotely from the mgmt portal
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
    async removeWorkspace(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { workspaceId } } = req;

            if (!workspaceId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            await workspaceService.remove(workspaceId.toString(), false);

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace Deleted.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for deleting the user remotely from the mgmt portal
     * @param { params: { userId } }req 
     * @param res 
     * @param next 
     */
    async removeUser(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { userId } } = req;

            if (!userId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            // Find if the user is owner of a workspace, in this case we will not delete him unless we remove the workspace
            const workspace = await Workspace.findOne({ _owner: userId });

            if (workspace) {
                return sendError(res, new Error('Could not delete the user. User is owner of a workspace!'), 'Could not delete the user. User is owner of a workspace!', 404);
            }

            // remove user
            const user = await User.findByIdAndDelete(userId).select('_account _workspace integrations');
            const workspaceId = user._workspace;

            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();

            // Remove user from groups
            await Group.updateMany({
                    _members: userId
                }, {
                    $pull: {
                        _members: userId
                    }
                });
            await Group.updateMany({
                    _admins: userId
                }, {
                    $pull: {
                        _admins: userId
                    }
                });

            // Remove user from workspaces
            const workspaceUpdated = await Workspace.findByIdAndUpdate(
                    workspaceId
                , {
                    $pull: {
                        _members: userId
                    }
                });

            const accountId = user?._account?._id || user?._account;
            if (accountId) {
                // Count the number of workspces for the account
                let accountUpdate = await Account.findById(accountId);
                const numWorkspaces = accountUpdate._workspaces.length;

                if (numWorkspaces < 2) {
                    // If account only has one workspace, the account is removed
                    accountUpdate = await Account.findByIdAndDelete(accountId);
                } else {
                    // If account has more than one workspaces, the workspace is removed from the account
                    accountUpdate = await Account.findByIdAndUpdate({
                            _id: accountId
                        }, {
                            $pull: {
                                _workspaces: workspaceId
                            }
                        });
                }
            } 

            // Send the status 200 response 
            return res.status(200).json({
                message: 'User Deleted.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * Mgmt Calls
     */

    /* | ======================================= BILLING ========================================== | */

    async createClientPortalSession(req: Request, res: Response, next: NextFunction) {
        
        try {
            const { workspaceId, return_url, mgmtApiPrivateKey } = req.body;

            let session;
            await managementService.createClientPortalSession(workspaceId, return_url, mgmtApiPrivateKey).then(res => {
                session = res['data']['session'];
            });

            // Send the status 200 response 
            return res.status(200).json({
                session: session
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async createStripeCheckoutSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { priceId, workspaceId, return_url, mgmtApiPrivateKey } = req.body;

            let session;
            let pk_stripe;
            await managementService.createStripeCheckoutSession(priceId, workspaceId, return_url, mgmtApiPrivateKey).then(res => {
                session = res['data']['session'];
                pk_stripe = res['data']['pk_stripe'];
            });

            // Send the status 200 response 
            return res.status(200).json({
                session: session,
                pk_stripe: pk_stripe
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getStripeCheckoutSession(req: Request, res: Response, next: NextFunction) {
        try {
            
            const { workspaceId, sessionId } = req.params;
            const { mgmtApiPrivateKey } = req.body;

            let workspace;
            let subscription;
            await managementService.getStripeCheckoutSession(sessionId, workspaceId, mgmtApiPrivateKey)
                .then(res => {
                    subscription = res['data']['subscription'];
                    workspace = res['data']['workspace'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                workspace: workspace,
                subscription: subscription
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for getting the current billing status
     * @param workspaceId
     */
    async getBillingStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.body;

            let message;
            let status;
            let blocked;
            let onPremise;
            await managementService.getBillingStatus(workspaceId, mgmtApiPrivateKey)
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                    blocked = res['data']['blocked'];
                    onPremise = res['data']['onPremise'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status,
                blocked: blocked,
                onPremise: onPremise
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for know if the workspace can access the billing page
     * Normally knowing if the environment is on-premise or on the cloud
     * @param workspaceId
     */
    async canActivateBilling(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.body;

            let message;
            let status;
            await managementService.canActivateBilling(workspaceId, mgmtApiPrivateKey)
            .then(res => {
                message = res['data']['message'];
                status = res['data']['status'];
            });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the subscription details for the currently loggedIn user
     */
    async getSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            // const { workspaceId } = req.params;
            const userId = req['userId'];

            const user = await User.findById({ _id: userId })
                .select('_id _workspace')
                .populate('_workspace', '_id management_private_api_key').lean();
            
            let subscription;
            await managementService.getSubscription(user._workspace._id, user._workspace.management_private_api_key)
                .then(res => {
console.log(res);
                    subscription = res['subscription'];
                });

            // const workspace = await Workspace.findById({ _id: workspaceId })
            //     .select('_id management_private_api_key').lean();
                
            // await managementService.getSubscription(workspace._id, workspace.management_private_api_key)
            //     .then(res => {
            //         subscription = res['data']['subscription'];
            //     });

            // Send the status 200 response 
            return res.status(200).json({
                subscription: subscription
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the stripe customer details for the currently loggedIn user
     */
    async getStripeCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            const { customerId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let customer;
            await managementService.getStripeCustomer(customerId, mgmtApiPrivateKey.toString())
                .then(res => {
                    customer = res['data']['customer'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                customer: customer
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the products for the subscription for the currently loggedIn user
     */
    // async getSubscriptionProducts(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         let products;
    //         await managementService.getSubscriptionProducts()
    //             .then(res => {
    //                 products = res['data'];
    //             });

    //         // Send the status 200 response 
    //         return res.status(200).json({
    //             products: products
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // }

    /**
     * This function fetches the prices for the subscription for the currently loggedIn user
     */
    // async getSubscriptionPrices(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { mgmtApiPrivateKey } = req.query;

    //         let prices;
    //         await managementService.getSubscriptionPrices(mgmtApiPrivateKey.toString())
    //             .then(res => {
    //                 prices = res['data']['prices'];
    //             });

    //         // Send the status 200 response 
    //         return res.status(200).json({
    //             prices: prices
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // }

    async isInTryOut(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.body;

            let message;
            let status;
            let time_remaining;
            await managementService.isInTryOut(workspaceId, mgmtApiPrivateKey)
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                    time_remaining = res['data']['time_remaining'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status,
                time_remaining: time_remaining
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /* | ======================================= BILLING ENDS ========================================== | */

    /**
     * This function is responsible for check if the workspace has flamingo active
     * @param workspaceId
     */
    async getFlamingoStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.getFlamingoStatus(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has idea active
     * @param workspaceId
     */
    async getIdeaStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.getIdeaStatus(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has excel import active
     * @param workspaceId
     */
    async getExcelImportStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.getExcelImportStatus(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has shuttle tasks mofule active
     * @param workspaceId
     */
    async isShuttleTasksModuleAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.isShuttleTasksModuleAvailable(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has files versions mofule active
     * @param workspaceId
     */
    async isFilesVersionsModuleAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.isFilesVersionsModuleAvailable(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has organization mofule active
     * @param workspaceId
     */
    async isOrganizationModuleAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.isOrganizationModuleAvailable(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has chat mofule active
     * @param workspaceId
     */
    async isChatModuleAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.isChatModuleAvailable(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has files versions mofule active
     * @param workspaceId
     */
    async isLoungeAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let status;
            await managementService.isLoungeAvailable(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    status = res['data']['status'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the workspace has organization mofule active
     * @param workspaceId
     */
    async getWorkspaceBaseURL(req: Request, res: Response, next: NextFunction) {
        try {
            const { workspaceId } = req.params;
            const { mgmtApiPrivateKey } = req.query;

            let message;
            let baseURL;
            await managementService.getWorkspaceBaseURL(workspaceId, mgmtApiPrivateKey.toString())
                .then(res => {
                    message = res['data']['message'];
                    baseURL = res['data']['baseURL'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: message,
                baseURL: baseURL
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
