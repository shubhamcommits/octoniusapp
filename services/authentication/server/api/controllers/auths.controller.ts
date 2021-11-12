import { Request, Response, NextFunction } from 'express';
import { Auth, User, Workspace, Group, Account } from '../models';
import { sendError, Auths, PasswordHelper, axios } from '../../utils';
import { AuthsService, ManagementService } from '../services';
import http from 'axios';
import moment from 'moment';

// Password Helper Class
const passwordHelper = new PasswordHelper();

// Authentication Utilities Class
const auths = new Auths();

const managementService = new ManagementService();
const authsService = new AuthsService();

export class AuthsController {

    /**
     * This function checks for workspace availability and whether a already user exist in the workspace or not
     * @param email 
     * @param workspace_name 
     */
    async checkUserAvailability(email: string) {

        return new Promise(async (resolve, reject) => {

            // Find the user with the given details
            const account = await Account.findOne({
                email: email
            });

            // If user is already a member, user must sign in
            if (account) {
                reject({
                    message: 'You are already a member of Octonius, please log in!',
                    error: 'Account already exist!'
                })
            }

            // Resolve the promise
            resolve({});
        })

    }

    /**
    * This function checks for workspace availability and whether a already user exist in the workspace or not
    * @param email 
    * @param workspace_name 
    */
    async checkUserAvailabilityInWorkspace(email: string, workspace_name: string) {

        return new Promise(async (resolve, reject) => {

            // Find the user with the given details
            const account = await Account.findOne({
                email: email
            });

            // Find the user with the given details
            const user = await User.findOne({
                workspace_name: workspace_name,
                _account: account._id,
                active: true
            });

            // If user is already a member, user must sign in
            if (user) {
                reject({
                    message: 'You are already a member of this workspace, please sign in!',
                    error: 'User already exist!'
                })
            }

            // Resolve the promise
            resolve({});
       })

   }

    /**
     * This function is responsible to signing up a user and creating the new account
     * @param req 
     * @param res 
     * @param next 
     */
    async signUp(req: Request, res: Response, next: NextFunction) {
        // Userdata variable which stores all the details
        const { userData } = req.body;

        await new AuthsController().checkUserAvailability(userData.email)
            .then(async () => {

                let account = await authsService.signUp(userData);
                
                // Error creating the new account
                if (!account) {
                    return sendError(res, new Error('Unable to create the account, some unexpected error occurred!'), 'Unable to create the account, some unexpected error occurred!', 500);
                }

                // Signup user and return the token
                return res.status(200).json({
                    message: `Welcome to Octonius!`,
                    // token: token,
                    account: account
                });
            })
            .catch((err) => {
                return sendError(res, err, 'User is already a member of Octonius!', 500);
            });
    };

    /**
     * This function is responsible to add a user to a workspace
     * @param req 
     * @param res 
     * @param next 
     */
    async joinWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            let { workspace, accountData } = req.body;

            // Check the Workspace and User Availability
            await new AuthsController().checkUserAvailabilityInWorkspace(accountData.email, workspace.workspace_name)
                .then(async () => {
                    // Split the user email domain to check and verify the accession to workplace on the basis of the domain
                    const userEmailDomain = accountData.email.split('@')[1];

                    const accessCode = workspace.access_code;
                    // Check if the workspace exist with particular (workspace_name and allowed_domains) or (workspace_name and invited_users)
                    workspace = await Workspace.findOne({
                        $or: [{
                                workspace_name: workspace.workspace_name,
                                allowed_domains: userEmailDomain
                            }, {
                                workspace_name: workspace.workspace_name,
                                "invited_users.email": accountData.email
                            }]
                    });

                    // Workspace not found!
                    if (!workspace) {
                        return sendError(res, new Error('Workspace does not exist or this email is not allowed to join this workspace!'), 'Workspace does not exist or this email is not allowed to join this workspace!', 404);
                    } else if (workspace.access_code != accessCode) {
                        return sendError(res, new Error('Your access code is wrong!'), 'Your access code is wrong!', 404);
                    }

                    const serviceReturn: any = await authsService.joinWorkplace(accountData, workspace);

                    // Signup user and return the token
                    return res.status(200).json({
                        message: `Welcome to ${workspace.workspace_name} Workspace!`,
                        token: serviceReturn.token,
                        user: serviceReturn.user,
                        workspace: serviceReturn.workspace
                    });

                })
                .catch((err) => {
                    return sendError(res, err, err.message, 500);
                });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for signing in a user
     * @param req 
     * @param res 
     * @param next 
     */
    async signIn(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Body data
            const { email, password } = req.body;

            // Find the account with having the same email as in req.body
            let account = await Account.findOne({
                email: email
            }).populate('_workspaces', '_id workspace_name workspace_avatar').lean();

            // TODO - workaround until we figure out where is the email set to null in Account model.
            if (!account) {
                // if the account doesn´t exist, we check if the email is in any user
                const users: any = await User.find({
                    email: email
                }).select('_account').lean();

                if (!users) {
                    return sendError(res, new Error('Email not found!'), 'Email not found!', 401);
                }

                account = await Account.findOne({
                    _id: (users[0]._account._id || users[0]._account)
                }).populate('_workspaces', '_id workspace_name workspace_avatar').lean();
            }

            // If user wasn't found or user was previsously removed/disabled, return error
            if (!account) {
                return sendError(res, new Error('Email not found!'), 'Email not found!', 401);
            }

            // Plain password received from the req.body
            const plainPassword = password;

            // Decrypting Password
            const passDecrypted: any = await passwordHelper.decryptPassword(plainPassword, account['password']);

            // If we are unable to decrypt the password from the server
            if (!passDecrypted.password) {
                return sendError(res, new Error('Unable to decrypt the password from the server'), 'Please enter a valid email or password!', 401);
            }

            // Generate new token and logs the auth record
            // let token = await auths.generateToken(user, workspace_name);

            // Send the status 200 response 
            return res.status(200).json({
                message: `User signed in!`,
                // token: token,
                account: account
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for authenticate the user in the selected workspace
     * @param req 
     * @param res 
     * @param next 
     */
    async selectWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            // Request Body data
            const { accountId, workspaceId } = req.body;

            // Find the account with having the same email as in req.body
            let user = await User.findOne({
                _account: accountId,
                _workspace: workspaceId,
                active: true
            });

            // If user wasn't found or user was previsously removed/disabled, return error
            if (!user) {
                return sendError(res, new Error('User does not exists!'), 'User does not exists!', 401);
            }

            // Generate new token and logs the auth record
            let token = await auths.generateToken(user, user['workspace_name']);

            // Send the status 200 response 
            return res.status(200).json({
                message: `User signed in!`,
                token: token,
                user: user
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getNumUsers(req: Request, res: Response, next: NextFunction) {
        try {

            const { email, password } = req.query;

            // Find the active user with having the same workspace_name and email as in req.body
            let users: any = await User.find({
                email: email,
                active: true
            });

            for (const user of users) {
                const passDecrypted: any = await passwordHelper.decryptPassword(password+'', user.password);
                if (!passDecrypted.password) {
                    users.splice(users.findIndex(u => u._id == user._id), 1);
                }
            }

            if (users.length > 1) {
                // Send the status 200 response 
                return res.status(200).json({
                    message: `There are ${users.length} users with the email ${req.query.email}!`,
                    numUsers: users.length
                });
            } else if (users.length == 1) {
                // Send the status 200 response 
                return res.status(200).json({
                    message: `There are ${users.length} users with the email ${req.query.email}!`,
                    numUsers: users.length,
                    workspace_name: users[0].workspace_name
                });   
            } else {
                return sendError(res, new Error('Please enter a valid combination or workspace name and user email or user might be disabled!'), 'Please enter a valid combination or workspace name and user email!', 401);
            }
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getUserWorkspaces(req: Request, res: Response, next: NextFunction) {
        try {

            // Request query data
            const { email, password } = req.query;
            
            // Find the active user with having the same workspace_name and email as in req.body
            let users: any = await User.find({
                email: email,
                active: true
            }).populate('_workspace', '_id workspace_name workspace_avatar');

            // If user wasn't found or user was previsously removed/disabled, return error
            if (!users) {
                return sendError(res, new Error('Please enter a valid user email or user might be disabled!'), 'Please enter a valid user email or user might be disabled!', 401);
            }

            for (const user of users) {
                const passDecrypted: any = await passwordHelper.decryptPassword(password+'', user.password);
                if (!passDecrypted.password) {
                    users.splice(users.findIndex(u => u._id == user._id), 1);
                }
            }

            const workspaces = users.map(user => { return user['_workspace'] });

            // Send the status 200 response 
            return res.status(200).json({
                message: `User is only in 1 or none workspace!`,
                workspaces: workspaces
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for signing out a user
     * @param req 
     * @param res 
     * @param next 
     */
    async signOut(req: Request, res: Response, next: NextFunction) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            }

            await http.post(`${process.env.USERS_SERVER_API}/auths/sign-out`, '', {
                 headers: headers 
            })

            await http.post(`${process.env.GROUPS_SERVER_API}/auths/sign-out`, '', {
                headers: headers
            })

            await http.post(`${process.env.POSTS_SERVER_API}/auths/sign-out`, '' , { 
                headers: headers 
            })

            await http.post(`${process.env.WORKSPACES_SERVER_API}/auths/sign-out`, '' , { 
                headers: headers 
            })

            // Updating the Auth model and set the signout state
            await Auth.findOneAndUpdate({
                _user: req['userId'],
                token: req.headers.authorization.split(' ')[1]
            }, {
                $set: {
                    token: null,
                    isLoggedIn: false
                }
            }, {
                new: true
            })


            req['userId'] = '';
            req.headers.authorization = undefined

            // Send the status 200 response 
            return res.status(200).json({
                message: 'User logged out!'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for adding the user to the subscription
     * @param req 
     * @param res 
     */
    async addUserToSubscription(req: Request, res: Response) {
        try {
            // Fetch current loggedIn User
            const user: any = await User.findOne({ _id: req['userId'] }).select('_workspace');

            // Send the status 200 response
            return res.status(200).json({
                message: 'User is added to the subscription!'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getOtherUserByEmail(req: Request, res: Response, next: NextFunction) {

        try {

            let email: any  = req.query.email;

            const user = await User.findOne({email: email});

            // Send status 200 response
            return res.status(200).json({
                message: 'User profile picture updated!',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for check if the user can create new workspaces
     * @param workspaceId
     */
    async isNewWorkplacesAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { environment } = req.query;

            let message;
            let status;

            await managementService.callNewWorkplacesAvailable(environment.toString())
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

    async authenticateSSOUsser(req: Request, res: Response, next: NextFunction) {

        try {
            const { userData } = req.body;

            let account = await Account.findOne({email: userData.email})
                .populate('_workspaces', '_id workspace_name workspace_avatar').lean();

            if (!account) {
                account = await authsService.signUp(userData);

                // Send status 200 response
                return res.status(200).json({
                    message: 'Account Created',
                    newAccount: true,
                    account: account
                });
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Account',
                newAccount: false,
                account: account
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}