import { Request, Response, NextFunction } from 'express';
import { Auth, User, Workspace, Group, Account } from '../models';
import { sendError, Auths, PasswordHelper, axios } from '../../utils';
import { AuthsService, ManagementService, NotificationsService } from '../services';
import LDAPAuthService from '../services/ldap-auth.service';

// Password Helper Class
const passwordHelper = new PasswordHelper();

// Authentication Utilities Class
const auths = new Auths();

const managementService = new ManagementService();
const authsService = new AuthsService();
const ldapAuthService = new LDAPAuthService();
const notificationsService = new NotificationsService();

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
                }).populate('_workspaces', '_id workspace_name workspace_avatar integrations').lean();

            // If user is already a member, user must sign in
            if (!!account) {

                const user = await User.find({
                        email: email
                    }).lean();

                if (!!user) {
                    reject({
                        message: 'You are already a member of Octonius, please log in!',
                        error: 'Account already exist!'
                    });
                } else {
                    resolve({
                        account: account
                    });
                }
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
        const { userData, ldap } = req.body;

        await new AuthsController().checkUserAvailability(userData.email)
            .then(async (resCheck) => {

                if (!!resCheck && !!resCheck['account']) {
                    // Signup user and return the token
                    return res.status(200).json({
                        message: `Welcome back to Octonius!`,
                        accountAlreadyExists: true,
                        account: resCheck['account']
                    });
                } else {
                    let account = await authsService.signUp(userData);
                    
                    // Error creating the new account
                    if (!account) {
                        return sendError(res, new Error('Unable to create the account, some unexpected error occurred!'), 'Unable to create the account, some unexpected error occurred!', 500);
                    }

                    // Signup user and return the token
                    return res.status(200).json({
                        message: `Welcome to Octonius!`,
                        account: account
                    });
                }
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

                    // Add workspace to user account
                    const accountUpdate: any = await Account.findByIdAndUpdate({
                            _id: accountData._id
                        }, {
                            $push: {
                                _workspaces: workspace
                            }
                        }, {
                            new: true
                        });

                    // Error updating the account
                    if (!accountUpdate) {
                        return sendError(res, new Error('Unable to update the account, some unexpected error occurred!'), 'Unable to update the account, some unexpected error occurred!', 500);
                    }

                    // Find if the user already exist in the workplace, but is inactive
                    let user = await User.findOne({
                            email: accountData.email,
                            workspace_name: workspace.workspace_name,
                            active: false
                        });

                    if (!!user) {
                        // As we found that user was disabled, then enable them accordingly.
                        user = await User.findOneAndUpdate(
                                { email: accountData.email },
                                { $set: { active: true } },
                                { new: true }
                            );
                    } else {
                        let groups = workspace.invited_users
                            .filter(invite => (invite.email == accountData.email && invite.type == 'group'))
                            .map(invite => invite._group);

                        if (groups && groups.length > 0) {

                            let userData: Object = {
                                _account: accountUpdate._id,
                                email: accountUpdate.email,
                                first_name: accountData.first_name,
                                last_name: accountData.last_name,
                                full_name: `${accountData.first_name} ${accountData.last_name}`,
                                _workspace: workspace._id,
                                workspace_name: workspace.workspace_name,
                                role: 'guest'
                            };

                            // Create new user with all the properties of userData
                            user = await User.create(userData);

                            for (let i = 0; i < groups.length; i++) {
                                // Add new user to group
                                const groupUpdate = await Group.findOneAndUpdate({
                                        _id: groups[i]._id || groups[i]
                                    }, {
                                        $push: {
                                            _members: user._id
                                        },
                                        $inc: { members_count: 1 }
                                    });
            
                                // Error updating the group
                                if (!groupUpdate) {
                                    return sendError(res, new Error(`Unable to update the group, some unexpected error occurred!`), `Unable to update the group, some unexpected error occurred!`, 500);
                                }
            
                                // Add group to user's groups
                                user = await User.findByIdAndUpdate({
                                        _id: user._id
                                    }, {
                                        $push: {
                                            _groups: groups[i]._id || groups[i]
                                        }
                                    });
                            }
                        } else {
                            let userData: Object = {
                                _account: accountUpdate._id,
                                email: accountUpdate.email,
                                first_name: accountData.first_name,
                                last_name: accountData.last_name,
                                full_name: `${accountData.first_name} ${accountData.last_name}`,
                                _workspace: workspace._id,
                                workspace_name: workspace.workspace_name,
                                role: 'member'
                            };

                            // Create new user with all the properties of userData
                            user = await User.create(userData);
                        }
    
                        // Error creating the new user
                        if (!user) {
                            return sendError(res, new Error('Unable to create the user, some unexpected error occurred!'), 'Unable to create the user, some unexpected error occurred!', 500);
                        }
    
                        // If user is invite, does not have access to global
                        if (user['role'] != 'guest') {
                            // Add new user to workspace's group
                            const groupUpdate = await Group.findOneAndUpdate({
                                    group_name: 'Global',
                                    _workspace: workspace._id
                                }, {
                                    $push: {
                                        _members: user._id
                                    },
                                    $inc: { members_count: 1 }
                                });
        
                            // Error updating the group
                            if (!groupUpdate) {
                                return sendError(res, new Error(`Unable to update the group, some unexpected error occurred!`), `Unable to update the group, some unexpected error occurred!`, 500);
                            }
        
                            // Add group to user's groups
                            user = await User.findByIdAndUpdate({
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
                            if (!user) {
                                return sendError(res, new Error('Unable to update the user, some unexpected error occurred!'), 'Unable to update the user, some unexpected error occurred!', 500);
                            }
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
                            }).populate({
                                path: 'members',
                                select: 'first_name last_name profile_pic current_position role email active'
                            }).lean();
    
                        // Error updating the Workspace and removing the user email
                        if (!workspace) {
                            return sendError(res, new Error('Unable to update the workspace, some unexpected error occurred!'), 'Unable to update the workspace, some unexpected error occurred!', 500);
                        }
                    }

                    // CREATE NOTIFICATION FOR HR, TO SET UP THE USER IN THE ENTITY
                    notificationsService.createNewUserNotificationForHR(user?._id, workspace?._id);

                    // Generate new token and logs the auth record
                    let token = await auths.generateToken(user, workspace.workspace_name);

                    // Send signup confirmation email
                    axios.post(`${process.env.MANAGEMENT_URL}/api/mail/join-workspace`, {
                        API_KEY: workspace.management_private_api_key,
                        user: user
                    });

                    // // Count all the users present inside the workspace
                    // const usersCount: number = await User.find({ $and: [
                    //     { active: true },
                    //     { _workspace: workspace._id }
                    // ] }).countDocuments();
                    
                    // // Send workspace to the mgmt portal
                    // // Count all the groups present inside the workspace
                    // const groupsCount: number = await Group.find({ $and: [
                    //     { group_name: { $ne: 'personal' } },
                    //     { _workspace: workspace._id }
                    // ]}).countDocuments();

                    // // Count all the users present inside the workspace
                    // const guestsCount: number = await User.find({ $and: [
                    //     { active: true },
                    //     { _workspace: workspace._id },
                    //     { role: 'guest'}
                    // ] }).countDocuments();

                    // let workspaceMgmt = {
                    //     _id: workspace._id,
                    //     company_name: workspace.company_name,
                    //     workspace_name: workspace.workspace_name,
                    //     owner_email: workspace.owner_email,
                    //     owner_first_name: workspace.owner_first_name,
                    //     owner_last_name: workspace.owner_last_name,
                    //     _owner_remote_id: workspace._owner._id || workspace._owner,
                    //     environment: process.env.DOMAIN,
                    //     num_members: usersCount,
                    //     num_invited_users: guestsCount,
                    //     num_groups: groupsCount,
                    //     created_date: workspace.created_date,
                    //     access_code: workspace.access_code,
                    //     management_private_api_key: workspace.management_private_api_key
                    // }
                    // axios.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                    //     API_KEY: workspace.management_private_api_key,
                    //     workspaceData: workspaceMgmt
                    // }).then().catch(err => console.log(err));

                    // Send user to the mgmt portal
                    let userMgmt = {
                        _id: user._id,
                        _account_id: accountUpdate._id,
                        active: user['active'],
                        email: accountUpdate.email,
                        password: accountUpdate.password,
                        first_name: user['first_name'],
                        last_name: user['last_name'],
                        _remote_workspace_id: workspace._id,
                        workspace_name: workspace.workspace_name,
                        environment: process.env.DOMAIN,
                        created_date: user['created_date']
                    }
                    axios.post(`${process.env.MANAGEMENT_URL}/api/user/add`, {
                        API_KEY: workspace.management_private_api_key,
                        workspaceId: workspace._id,
                        userData: userMgmt,
                        // workspaceData: workspaceMgmt
                    }).then().catch(err => console.log(err));

                    const mailUser = {
                        first_name: user['first_name'],
                        email: accountUpdate.email,
                        workspace_name: workspace.workspace_name
                    }
                    // Send signup confirmation email
                    axios.post(`${process.env.MANAGEMENT_URL}/api/mail/sign-up`, {
                        user: mailUser
                    });

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
            }).populate('_workspaces', '_id workspace_name workspace_avatar integrations').lean();

            // TODO - workaround until we figure out where is the email set to null in Account model.
            if (!account) {
                // if the account doesn´t exist, we check if the email is in any user
                const users: any = await User.find({
                    email: email
                }).select('_account').lean();

                if (!users || users.length == 0) {
                    return sendError(res, new Error('Email not found!'), 'Email not found!', 401);
                }

                account = await Account.findOne({
                    _id: (users[0]._account._id || users[0]._account)
                }).populate('_workspaces', '_id workspace_name workspace_avatar integrations').lean();
            }

            // If user wasn't found or user was previsously removed/disabled, return error
            if (!account) {
                return sendError(res, new Error('Email not found!'), 'Email not found!', 401);
            }

            let workplaceLDAPIntegrations: any;
            if (account._workspaces && account._workspaces.length > 0) {
                for (let i = 0; (i < account._workspaces.length && !workplaceLDAPIntegrations); i++) {
                    let workplace = account._workspaces[i];
                    if (workplace && workplace.integrations && workplace.integrations.is_ldap_connected) {
                        workplaceLDAPIntegrations = {
                            ldap_url: workplace.integrations.ldap_url,
                            ldap_dn: workplace.integrations.ldap_dn,
                            ldap_password: workplace.integrations.ldap_password,
                            ldap_search_base: workplace.integrations.ldap_search_base,
                            is_ldap_connected: workplace.integrations.is_ldap_connected
                        }
                    }
                }
            }

            let ldapUser;
            if (workplaceLDAPIntegrations && workplaceLDAPIntegrations.is_ldap_connected) {
                ldapUser = await ldapAuthService.auth(email, password, workplaceLDAPIntegrations);
            }

            // Decrypting Password
            const passDecrypted: any = await passwordHelper.decryptPassword(password, account['password']);

            // If we are unable to decrypt the password from the server
            if (!passDecrypted.password) {
                if (workplaceLDAPIntegrations && workplaceLDAPIntegrations.is_ldap_connected && ldapUser) {
                    // Update octonius pwd with LDAP pwd
                    const passEncrypted: any = await passwordHelper.encryptPassword(password);

                    // If we are unable to encrypt the password and store into the server
                    if (!passEncrypted.password) {
                        return sendError(res, new Error('Unable to encrypt the password to the server'), 'Unable to encrypt the password to the server, please try with a different password!', 401);
                    }

                    account = await Account.findByIdAndUpdate({
                            _id: account._id
                        }, {
                            $set: { password: passEncrypted.password }
                        }, {
                            new: true
                        }).populate('_workspaces', '_id workspace_name workspace_avatar integrations').lean();
                } else {
                    return sendError(res, new Error('Unable to decrypt the password from the server'), 'Please enter a valid email or password!', 401);
                }
            }

            // Send the status 200 response 
            return res.status(200).json({
                message: `User signed in!`,
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
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

            if (user['stats']) {
                if (user['stats']['favorite_groups']) {
                    user['stats']['favorite_groups'].sort(function(a, b) {
                        return b.group_name - a.group_name;
                    });
                }

                if (user['stats']['favorite_portfolios']) {
                    user['stats']['favorite_portfolios'].sort(function(a, b) {
                        return b.portfolio_name - a.portfolio_name;
                    });
                }
            }

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
                });

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
            } else {
                account = await Account.findByIdAndUpdate({
                        _id: account._id
                    }, {
                        $set: {
                            ssoType: userData.ssoType
                        }
                    }, {
                        new: true
                    })
                    .populate('_workspaces', '_id workspace_name workspace_avatar')
                    .lean();
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

    async getAllWorkspacesIntegrations(req: Request, res: Response, next: NextFunction) {

        try {
            // Find the workspace and update their respective workspace settings
            const workspace = await Workspace.find()
                .select('integrations')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Workspaces found!',
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async getAllowedWorkspacesByDomain(req: Request, res: Response, next: NextFunction) {

        try {
            const { email } = req.query;
            
            // Split the user email domain to check and verify the accession to workplace on the basis of the domain
            const userEmailDomain = (email+'').split('@')[1];

            // Find the workspace and update their respective workspace settings
            let workspaces = await Workspace.find({
                $and: [{
                        $or: [{
                            allowed_domains: userEmailDomain
                        }, {
                            "invited_users.email": email
                        }]
                    }]
                })
                .select('_id workspace_avatar workspace_name')
                .populate('members', 'email')
                .populate('_owner', 'email')
                .lean();

            let retWorkspaces = [];
            for (let i = 0; i < workspaces.length; i++) {
                let workspace = workspaces[i];

                let membersEmails = [];
                for (let i = 0; i < workspace.members.length; i++) {
                    membersEmails.push(workspace.members[i].email);
                }

                if (workspace._owner.email !== email && membersEmails.indexOf(email) < 0) {
                    retWorkspaces.push(workspace);
                }
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Workspaces found!',
                workspaces: retWorkspaces
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This method will return true, since if the auth is not correct it will fail in the previous checks
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    // isRightAuthToken(req: Request, res: Response, next: NextFunction) {
    //     return res.status(200).json({
    //             message: 'User is correctly log in.',
    //             valid: true
    //         });
    // }

    /**
     * This function fetches the stripe customer details for the currently loggedIn user
     */
   async getSubscriptionProducts(req: Request, res: Response, next: NextFunction) {
        try {
            let products;
            await authsService.getSubscriptionProducts()
                .then(res => {
                    products = res['data'];
                });

            // Send the status 200 response 
            return res.status(200).json({
                products: products
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}