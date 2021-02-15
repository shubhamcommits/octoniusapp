import { sendError, PasswordHelper, Auths } from '../../utils';
import { Group, Workspace, User } from '../models';
import { Request, Response, NextFunction } from 'express';
import { CommonService, UsersService } from '../services';
import http from 'axios';
import moment from 'moment';
import mongoose from "mongoose";

// Password Helper Class
const passwordHelper = new PasswordHelper();

// User Service Instance
const usersService = new UsersService();

const commonService = new CommonService();

const auths = new Auths();

export class WorkspaceController {

    /**
     * This function checks whether the workspace name is available to create or not
     * @param { query.workspace_name }req 
     * @param res 
     * @param next 
     */
    async checkWorkspaceAvailability(req: Request, res: Response, next: NextFunction) {
        try {

            let { workspace_name } = req.query;

            // Find the workspace on the basis of workspace_name
            const workspace = await Workspace.findOne({ workspace_name: workspace_name })

            // Workspace name already exists
            if (workspace) {
                return sendError(res, new Error('This Workspace name has already been taken, please pick another name!'), 'This Workspace name has already been taken, please pick another name!', 409);

            } else {

                // Send the status 200 response 
                return res.status(200).json({
                    message: 'This Workspace name is available!',
                    workspace: workspace_name
                });
            }

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the workspace details
     * @param req 
     * @param res 
     * @param next 
     */
    async getWorkspace(req: Request, res: Response, next: NextFunction) {

        const { workspaceId } = req.params;

        try {

            // Find the workspace based on the workspaceId
            const workspace: any = await Workspace.findOne({
                _id: workspaceId
            })
                .populate({
                    path: 'members',
                    select: 'first_name last_name profile_pic role email active',
                    /*
                    options: {
                        limit: 10
                    }
                    */
                })
                .lean()
                .exec();

            // Workspace Company Members Count
            const membersCount = await User.find({
                $and: [
                    { _workspace: workspaceId }
                ]
            }).countDocuments();

            // If unable to find the workspace
            if (!workspace) {
                return sendError(res, new Error('Unable to fetch the workspace details, as the workspaceId was invalid!'), 'Unable to fetch the workspace details, as the workspaceId was invalid!', 404);
            }

            // Add time remaining property to maintain the trial version of the user
            workspace.time_remaining = moment(workspace.created_date).add(15, 'days').diff(moment(), 'days');

            // Add company members count
            workspace.company_members_count = membersCount;

            // Send the status 200 response 
            return res.status(200).json({
                message: `${workspace.workspace_name} workspace found!`,
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for creating a new workspace
     * @param { body: { owner_first_name, owner_last_name, owner_password, owner_email, workspace_name, company_name } }req 
     * @param res 
     * @param next 
     * 
     * It performs the following functionalities:
     * 1. Encrypt the password.
     * 2. Create a new workspace object.
     * 3. Creates a new user object and mark it as 'owner' of this newly created workspace.
     * 4. Creates a new group named as 'Global' and adds this newly created user into that group and make them as the 'admin' of that group.
     * 5. Updates the user document and pass 'Global' group to user's groups.
     * 6. Creates a new group named as 'Personal' which remains as the private group of that user and shall be used in the myworkplace.
     * 7. Generate a new JWT token and signin this newly created user and logs into the auth record
     * 8. Sends the email of new signup and account created to the user's email address. (Using mailing microservice)
     * 9. Sends the email of newly created workspace to the user's email address. (Using mailing microservice)
     */
    async createNewWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            // Generate hash password
            const passEncrypted: any = await passwordHelper.encryptPassword(req.body.owner_password);

            // Error creating the password
            if (!passEncrypted) {
                return sendError(res, new Error('Unable to encrypt the password to the server'), 'Unable to encrypt the password to the server, please try with a different password!', 401);
            }

            // Prepare workspace data before creation
            const newWorkspace = req.body;
            newWorkspace.owner_password = passEncrypted.password;

            // Pass user email domain to allowed domains
            const userEmailDomain = req.body.owner_email.split('@')[1];
            newWorkspace.allowed_domains = [userEmailDomain];

            // Create new workspace
            const workspace = await Workspace.create(newWorkspace);

            // Error creating workspace
            if (!workspace) {
                return sendError(res, new Error('Unable to create the workspace, some unexpected error occured!'), 'Unable to create the workspace, some unexpected error occured!', 500);
            }

            // Prepare new user data
            const newUser = {
                first_name: req.body.owner_first_name,
                last_name: req.body.owner_last_name,
                full_name: `${req.body.owner_first_name} ${req.body.owner_last_name}`,
                email: req.body.owner_email,
                password: passEncrypted.password,
                workspace_name: req.body.workspace_name,
                company_name: req.body.company_name,
                _workspace: workspace,
                role: 'owner'
            };

            // Create new user with owner rights
            const user: any = await User.create(newUser);

            // Error creating user
            if (!user) {
                return sendError(res, new Error('Unable to create the user, some unexpected error occured!'), 'Unable to create the user, some unexpected error occured!', 500);
            }

            // Pass user as workspace member and _owner
            const workspaceUpdate: any = await Workspace.findByIdAndUpdate({
                _id: workspace._id
            }, {
                $set: {
                    _owner: user,
                },
                $push: {
                    members: user
                }
            }, {
                new: true
            })
                .select('_id workspace_name owner_first_name owner_email')

            // Error updating the workspace
            if (!workspaceUpdate) {
                return sendError(res, new Error('Unable to update the workspace, some unexpected error occured!'), 'Unable to update the workspace, some unexpected error occured!', 500);
            }

            // Pepare global group data
            const globalGroup = {
                group_name: 'Global',
                _workspace: workspaceUpdate._id,
                _admins: user,
                workspace_name: workspaceUpdate.workspace_name,
                members_count: 1
            };

            // Create new global group
            let group = await Group.create(globalGroup);

            // Error creating global group
            if (!group) {
                return sendError(res, new Error('Unable to create the global group, some unexpected error occured!'), 'Unable to create the global group, some unexpected error occured!', 500);
            }

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

            // Add Global group to user's groups
            var userUpdate = await User.findByIdAndUpdate({
                _id: user._id
            }, {
                $push: {
                    _groups: group,
                    'stats.favorite_groups': group._id
                }
            }, {
                new: true
            });

            // Error updating the user
            if (!userUpdate) {
                return sendError(res, new Error('Unable to update the user, some unexpected error occured!'), 'Unable to update the user, some unexpected error occured!', 500);
            }

            // Prepare newGroupData
            const newGroupData = {
                group_name: 'personal',
                _workspace: workspaceUpdate._id,
                _admins: [user._id],
                workspace_name: workspaceUpdate.workspace_name
            };

            // Check if the group exist or not
            const privateGroup = await Group.findOne({
                group_name: newGroupData.group_name,
                _admins: newGroupData._admins,
                workspace_name: newGroupData.workspace_name
            });

            // Send error if the personal group exists
            if (!!privateGroup) {
                return sendError(res, new Error('Group name already taken, please choose another name!'), 'Group name already taken, please choose another name!', 409);
            } else {

                // Create personal group
                let group = await Group.create(newGroupData);

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
                userUpdate = await User.findByIdAndUpdate({
                    _id: newGroupData._admins,
                    _workspace: newGroupData._workspace
                }, {
                    $push: {
                        _groups: group
                    },
                    $set: {
                        _private_group: group
                    }
                }, {
                    new: true
                });
            }

            // Generate new token and logs the auth record
            let token = await auths.generateToken(userUpdate, workspaceUpdate.workspace_name);

            // Send signup confirmation email using mailing microservice
            http.post(`${process.env.MAILING_SERVER_API}/sign-up`, {
                user: userUpdate
            })

            // Send new workspace confirmation email
            http.post(`${process.env.MAILING_SERVER_API}/new-workspace`, {
                workspace: workspaceUpdate
            })

            // Send the status 200 response
            return res.status(200).json({
                message: 'Workspace created!',
                token: token,
                user: userUpdate
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function updates the workspace data based on the workspaceId
     * @param { params: { workspaceId }, body: { workspace } }req 
     * @param res 
     * @param next 
     */
    async updateWorkspace(req: Request, res: Response, next: NextFunction) {

        const { params: { workspaceId }, body } = req;

        try {

            // Update the workspace by setting the new data
            const workspaceData: any = await Workspace.findOneAndUpdate({
                _id: workspaceId
            }, {
                $set: body
            }, {
                new: true
            })
                .populate({
                    path: 'members',
                    select: 'first_name last_name profile_pic role email active',
                    options: {
                        limit: 10
                    },
                    match: {
                        active: true
                    }
                })
                .lean()

            // Send the status 200 response
            return res.status(200).json({
                message: `${workspaceData.workspace_name} workspace was updated!`,
                workspace: workspaceData
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * Fetches the unique email domains that exist within
     * the given workspace that match the given query.
     */
    async getUniqueEmailDomains(req: Request, res: Response) {
        const { workspaceId, query } = req.params;

        try {
            // Get the emails
            let emails: any = await User.find({ _workspace: workspaceId }).select('email');
            emails = emails.map(userDoc => userDoc.email); // get rid of _id

            // Generate the domails
            const emailDomains = emails.map((email: any) => {
                const index = email.indexOf('@');
                return email.substring(index + 1);
            });

            // Remove duplicates
            const domainsTmp = Array.from(new Set(emailDomains));
            let domains = [];
            // Match the query
            domainsTmp.forEach((domain: string) => {
                if (domain.includes(query)) {
                    domains.push(domain);
                }
            });

            return res.status(200).json({
                domains: domains.slice(0, 5) // Limit result to 5
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * Fetches the unique job positions that exist within
     * the given workspace that match the given query.
     */
    async getUniqueJobPositions(req: Request, res: Response) {
        const { workspaceId, query } = req.params;

        try {
            const positions = await User
                .find({
                    _workspace: workspaceId,
                    current_position: { $regex: new RegExp(query.toString(), 'i') }
                })
                .distinct('current_position')
                .where('current_position').ne(null);

            return res.status(200).json({
                positions: positions.slice(0, 5) // Limit results to 5
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * Fetches the unique skills that exist within
     * the given workspace that match the given query.
     */
    async getUniqueSkills(req: Request, res: Response) {
        const { workspaceId, query } = req.params;

        try {
            const users: any = await User
                .find({ _workspace: workspaceId })
                .select('skills')
                .where('skills').ne(null);

            // Get skills from user documents
            const skills = [];
            users.map(userDoc => userDoc.skills.map(skill => skills.push(skill)));

            // Remove duplicates
            let filteredSkills = Array.from(new Set(skills));

            // Match the query
            filteredSkills = filteredSkills.filter(skill => skill.includes(query));

            return res.status(200).json({
                skills: filteredSkills.slice(0, 5) // Limit result to 5
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for inviting a user
     * @param req 
     * @param res 
     * @param next 
     */
    async inviteUser(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the user from the req.body
            let { body: { user } } = req;

            // Check if the user data is not an empty object
            if (JSON.stringify(user) == JSON.stringify({}) || JSON.stringify(req.body) == JSON.stringify({}))
                return res.status(400).json({
                    message: 'Bad request as the request body was empty!'
                })

            // Send the invite to workspace
            let send = await usersService.inviteUserToJoin(
                user.email, user.workspace_name, user.type, user.group_name
            )

            // Send signup invite to user
            // if(send == true)
                http.post(`${process.env.MAILING_SERVER_API}/invite-user`, {
                    data: {
                        from: req['userId'],
                        email: user.email,
                        workspace: user.workspace_name,
                        type: user.type,
                        group_name: user.group_name
                    }
                })

            return res.status(200).json({
                message: 'User has been invited!'
            })

        } catch (error) {
            return sendError(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction) {

        try {
            const { workspaceId } = req.params;

            if (!workspaceId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            // Delete the users related
            await User.deleteMany({_workspace: workspaceId});

            // Delete the groups
            const groups = await Group.find({ _workspace: workspaceId });
            groups.forEach(async group => {
                await commonService.removeGroup(group._id);
            });

            let workspace = await Workspace.findOne({_id: workspaceId}).select('billing');

            if (workspace && workspace['billing'] && workspace['billing']['client_id']) {
                // Remove stripe client
                const stripe = require('stripe')(process.env.SK_STRIPE);
                stripe.customers.del(workspace['billing']['client_id']);
            }

            // Delete the workspace
            workspace = await Workspace.findByIdAndDelete(workspaceId);

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace Deleted.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}