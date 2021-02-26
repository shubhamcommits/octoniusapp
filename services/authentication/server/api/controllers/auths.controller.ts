import { Request, Response, NextFunction } from 'express';
import { Auth, User, Workspace, Group, Account } from '../models';
import { sendError, Auths, PasswordHelper } from '../../utils';
import http from 'axios';

// Create Stripe Object
const stripe = require('stripe')(process.env.SK_STRIPE);

// Password Helper Class
const passwordHelper = new PasswordHelper();

// Authentication Utilities Class
const auths = new Auths();

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
                _account: account._id
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
                // Encrypting user password
                const passEncrypted: any = await passwordHelper.encryptPassword(userData.password);

                // If we are unable to encrypt the password and store into the server
                if (!passEncrypted.password) {
                    return sendError(res, new Error('Unable to encrypt the password to the server'), 'Unable to encrypt the password to the server, please try with a different password!', 401);
                }

                // Updating the password value with the encrypted password
                userData.password = passEncrypted.password;

                // Adding _workspace property to userData variable
                userData._workspaces = [];

                // Create new user with all the properties of userData
                let account: any = await Account.create(userData);

                // Error creating the new account
                if (!account) {
                    return sendError(res, new Error('Unable to create the account, some unexpected error occured!'), 'Unable to create the account, some unexpected error occured!', 500);
                }

                // Generate new token and logs the auth record
                // let token = await auths.generateToken(account);

                // Send signup confirmation email using mailing microservice
                http.post(`${process.env.MAILING_SERVER_API}/sign-up`, {
                    user: account
                })

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
                        workspace_name: workspace.workspace_name,
                        allowed_domains: userEmailDomain
                    });

                    // Workspace not found!
                    if (!workspace) {
                        return sendError(res, new Error('Workspace does not exist or this email is not allowed to join this workspace!'), 'Workspace does not exist or this email is not allowed to join this workspace!', 404);
                    } else if (workspace.access_code != accessCode) {
                        return sendError(res, new Error('Your access code is wrong!'), 'Your access code is wrong!', 404);
                    }

                    // Add workspace to user account
                    const accountUpdate: any = await Account.findByIdAndUpdate({
                        _id: accountData._id
                    }, {
                        $push: {
                            _workspaces: workspace
                        }
                    }, {
                        new: true
                    })

                    // Error updating the account
                    if (!accountUpdate) {
                        return sendError(res, new Error('Unable to update the account, some unexpected error occured!'), 'Unable to update the account, some unexpected error occured!', 500);
                    }

                    let userData: Object = {
                        _account: accountUpdate._id,
                        first_name: accountData.first_name,
                        last_name: accountData.last_name,
                        full_name: `${accountData.first_name} ${accountData.last_name}`,
                        // Adding _workspace property to userData variable
                        _workspace: workspace._id,
                        workspace_name: workspace.workspace_name,
                        role: 'member'
                    };
                    // Create new user with all the properties of userData
                    let user: any = await User.create(userData);

                    // Error creating the new user
                    if (!user) {
                        return sendError(res, new Error('Unable to create the user, some unexpected error occured!'), 'Unable to create the user, some unexpected error occured!', 500);
                    }

                    // Add new user to workspace's group
                    const groupUpdate = await Group.findOneAndUpdate({
                        // TODO - check how to do when someone is invite only to specific group
                        //group_name: (type == 'group') ? group_name : 'Global',
                        group_name: 'Global',
                        workspace_name: workspace.workspace_name
                    }, {
                        $push: {
                            _members: user._id
                        },
                        $inc: { members_count: 1 }
                    });

                    // Error updating the group
                    if (!groupUpdate) {
                        return sendError(res, new Error(`Unable to update the group, some unexpected error occured!`), `Unable to update the group, some unexpected error occured!`, 500);
                    }

                    // Add group to user's groups
                    let userUpdate: any = await User.findByIdAndUpdate({
                        _id: user._id
                    }, {
                        $push: {
                            _groups: groupUpdate._id,
                            'stats.favorite_groups': groupUpdate._id
                        }
                    }, {
                        new: true
                    });

                    // Error updating the user
                    if (!userUpdate) {
                        return sendError(res, new Error('Unable to update the user, some unexpected error occured!'), 'Unable to update the user, some unexpected error occured!', 500);
                    }

                    // personalGroupData variable to create group for my workplace
                    const personalGroupData = {
                        group_name: 'personal',
                        _workspace: workspace._id,
                        _admins: [user._id],
                        workspace_name: workspace.workspace_name
                    };

                    // Check if personal group already exist
                    const personalGroup = await Group.findOne({
                        group_name: personalGroupData.group_name,
                        _admins: personalGroupData._admins,
                        workspace_name: personalGroupData.workspace_name,
                    });

                    // Send Error response if 'personal' group already exist
                    if (!!personalGroup) {
                        return sendError(res, new Error('Group name already taken, please choose another name!'), 'Group name already taken, please choose another name!', 409);
                    } else {

                        // Create new personal group
                        let group = await Group.create(personalGroupData);

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
                        });
                            

                        // Add personal group to user's groups
                        user = await User.findByIdAndUpdate({
                            _id: personalGroupData._admins,
                            _workspace: personalGroupData._workspace
                        }, {
                            $push: {
                                _groups: group._id
                            },
                            $set: {
                                _private_group: group
                            }
                        }, {
                            new: true
                        });
                    }

                    // Add new user to workspace members and remove user email
                    workspace = await Workspace.findByIdAndUpdate({
                        _id: workspace._id
                    }, {
                        $push: {
                            members: user._id
                        }
                    }, {
                        new: true
                    })

                    // Error updating the Workspace and removing the user email
                    if (!workspace) {
                        return sendError(res, new Error('Unable to update the workspace, some unexpected error occured!'), 'Unable to update the workspace, some unexpected error occured!', 500);
                    }

                    // Generate new token and logs the auth record
                    let token = await auths.generateToken(user, workspace.workspace_name);

                    // Send signup confirmation email using mailing microservice
                    http.post(`${process.env.MAILING_SERVER_API}/join-workspace`, {
                        // TODO - send the proper data
                        user: userUpdate
                    })

                    // Count all the users present inside the workspace
                    const usersCount: number = await User.find({ $and: [
                        { active: true },
                        { _workspace: workspace._id }
                    ] }).countDocuments();

                    if (workspace.billing.subscription_id) {
                        // Update the subscription details
                        let subscription = stripe.subscriptions.update(workspace.billing.subscription_id, {
                            price: workspace.billing.price_id,
                            quantity: usersCount
                        });
                    }

                    // Update the4 workspace details
                    await Workspace.findOneAndUpdate({
                        _id: workspace._id
                    }, {
                        'billing.quantity': usersCount
                    });

                    // Send workspace to the mgmt portal
                    if (process.env.NODE_ENV == 'production') {
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
                            num_invited_users: workspace.invited_users ? workspace.invited_users.length : 0,
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
                            active: user.active,
                            email: user.email,
                            password: user.password,
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

                    // Signup user and return the token
                    return res.status(200).json({
                        message: `Welcome to ${workspace.workspace_name} Workspace!`,
                        token: token,
                        user: user,
                        workspace: workspace
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
            }).populate('_workspaces', '_id workspace_name workspace_avatar');

            // If user wasn't found or user was previsously removed/disabled, return error
            if (!account) {
                return sendError(res, new Error('Email not found!'), 'Email not found!', 401);
            }

            // Plain password received from the req.body
            const plainPassword = password;

            // Decrypting Password
            const passDecrypted: any = await passwordHelper.decryptPassword(plainPassword, account.password);

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
                _workspace: workspaceId
            });

            // If user wasn't found or user was previsously removed/disabled, return error
            if (!user) {
                return sendError(res, new Error('User does not exists!'), 'User does not exists!', 401);
            }

            // Generate new token and logs the auth record
            let token = await auths.generateToken(user, user.workspace_name);

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
}