import { Request, Response, NextFunction } from 'express';
import { Auth, User, Workspace, Group } from '../models';
import { sendError, Auths, PasswordHelper } from '../../utils';
import http from 'axios';

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
    async checkUserAvailability(email: string, workspace_name: string) {

        return new Promise(async (resolve, reject) => {

            // Find workspace with respective workspace_name
            const workspace = await Workspace.findOne({ workspace_name: workspace_name });

            // Workspace not found
            if (!workspace) {
                reject({
                    message: 'Invalid workspace name!',
                    error: 'Invalid workspace name!'
                })
            }

            // Find the user with the given details
            const user = await User.findOne({
                workspace_name: workspace_name,
                email: email
            });

            // If user is already a member, user must sign in
            if (user) {
                reject({
                    message: 'You are already a member of this workspace, please sign in!',
                    error: 'User already exist!'
                })
            }

            // Resolve the promise
            resolve();
        })

    }

    /**
     * This function is responsible to signing up a user and creating their new account
     * @param req 
     * @param res 
     * @param next 
     */
    async signUp(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Body Data
            const { workspace_name, email, password, first_name, last_name } = req.body;

            // Check the Workspace and User Availability
            await new AuthsController().checkUserAvailability(email, workspace_name)
                .then(async () => {

                    // Userdata variable which stores all the details
                    const userData = req.body;

                    // Split the user email domain to check and verify the accession to workplace on the basis of the domain
                    const userEmailDomain = req.body.email.split('@')[1];

                    // Adding full_name property to userData variab;e
                    userData.full_name = `${first_name} ${last_name}`;

                    // Check if the workspace exist with particular (workspace_name and allowed_domains) or (workspace_name and invited_users)
                    let workspace: any = await Workspace.findOne({
                        $or: [{
                            workspace_name: workspace_name,
                            allowed_domains: userEmailDomain
                        }, {
                            workspace_name: workspace_name,
                            invited_users: email
                        }]
                    });

                    // Workspace not found!
                    if (!workspace) {
                        return sendError(res, new Error('Workspace does not exist or this email is not allowed to join this workspace!'), 'Workspace does not exist or this email is not allowed to join this workspace!', 404);
                    }

                    // Encrypting user password
                    const passEncrypted: any = await passwordHelper.encryptPassword(password);

                    // If we are unable to encrypt the password and store into the server
                    if (!passEncrypted.password) {
                        return sendError(res, new Error('Unable to encrypt the password to the server'), 'Unable to encrypt the password to the server, please try with a different password!', 401);
                    }

                    // Updating the password value with the encrypted password
                    userData.password = passEncrypted.password;

                    // Adding _workspace property to userData variable
                    userData._workspace = workspace._id;

                    // Adding role property to userData variable
                    userData.role = 'member';

                    // Create new user with all the properties of userData
                    let user = await User.create(userData);

                    // Error creating the new user
                    if (!user) {
                        return sendError(res, new Error('Unable to create the user, some unexpected error occured!'), 'Unable to create the user, some unexpected error occured!', 500);
                    }

                    // Add new user to workspace's Global group
                    const globalGroupUpdate = await Group.findOneAndUpdate({
                        group_name: 'Global',
                        workspace_name: workspace_name
                    }, {
                        $push: {
                            _members: user._id
                        },
                        $inc: { members_count: 1 }
                    });

                    // Error updating the Global group
                    if (!globalGroupUpdate) {
                        return sendError(res, new Error('Unable to update the global group, some unexpected error occured!'), 'Unable to update the global group, some unexpected error occured!', 500);
                    }

                    // Add Global group to user's groups
                    const userUpdate = await User.findByIdAndUpdate({
                        _id: user._id
                    }, {
                        $push: {
                            _groups: globalGroupUpdate._id
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
                        _admins: user._id,
                        workspace_name: workspace_name
                    };

                    // Check if personal group already exist
                    const groupExist = await Group.findOne({
                        group_name: personalGroupData.group_name,
                        _admins: personalGroupData._admins,
                        workspace_name: personalGroupData.workspace_name
                    });

                    // Send Error response if 'personal' group already exist
                    if (!!groupExist) {
                        return sendError(res, new Error('Group name already taken, please choose another name!'), 'Group name already taken, please choose another name!', 409);
                    } else {

                        // Create new personal group
                        const group = await Group.create(personalGroupData);

                        // Add personal group to user's groups
                        user = await User.findByIdAndUpdate({
                            _id: personalGroupData._admins,
                            _workspace: personalGroupData._workspace
                        }, {
                            $push: {
                                _groups: group._id
                            }
                        }, {
                            new: true
                        });
                    }

                    // Add new user to workspace members and remove user email from invited users
                    workspace = await Workspace.findByIdAndUpdate({
                        _id: workspace._id
                    }, {
                        $push: {
                            members: user._id
                        },
                        $pull: {
                            invited_users: email
                        }
                    }, {
                        new: true
                    })

                    // Error updating the Workspace and removing the user email from invited users
                    if (!workspace) {
                        return sendError(res, new Error('Unable to update the workspace, some unexpected error occured!'), 'Unable to update the workspace, some unexpected error occured!', 500);
                    }

                    // Generate new token and logs the auth record
                    let token = await auths.generateToken(user, workspace_name);

                    // Send signup confirmation email using mailing microservice
                    await http.post('http://localhost:2000/api/mails/sign-up', {
                        user: userUpdate
                    })

                    // Updating quantity += 1 in stripe module using workspace microservice
                    await http.put(`http://localhost:5000/api/billings/add-user?subscriptionId=${workspace.billing.subscription_id}&workspaceId=${workspace._id}`)

                    // Signup user and return the token
                    return res.status(200).json({
                        message: `Welcome to ${workspace_name} Workspace!`,
                        token: token,
                        user: user
                    });

                })
                .catch((err) => {
                    return sendError(res, err, 'Either workspace doesn\'t exist or user is already a member of this workspace!', 500);
                })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for signing in a user
     * @param req 
     * @param res 
     * @param next 
     */
    async signIn(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Body data
            const { email, password, workspace_name } = req.body;

            // Find the active user with having the same workspace_name and email as in req.body
            const user: any = await User.findOne({
                workspace_name: workspace_name,
                email: email,
                active: true
            });

            // If user wasn't found or user was previsously removed/disabled, return error
            if (!user) {
                return sendError(res, new Error('Please enter a valid combination or workspace name and user email or user might be disabled!'), 'Please enter a valid combination or workspace name and user email!', 401);
            }

            // Plain password received from the req.body
            const plainPassword = password;

            // Decrypting Password
            const passDecrypted: any = await passwordHelper.decryptPassword(plainPassword, user.password);

            // If we are unable to decrypt the password from the server
            if (!passDecrypted.password) {
                return sendError(res, new Error('Unable to decrypt the password from the server'), 'Please enter a valid email or password!', 401);
            }

            // Generate new token and logs the auth record
            let token = await auths.generateToken(user, workspace_name);

            // Send the status 200 response 
            return res.status(200).json({
                message: `User signed in ${user.workspace_name} Workspace!`,
                token: token,
                user: user
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

            // Send the status 200 response 
            return res.status(200).json({
                message: 'User logged out!'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}