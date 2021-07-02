import { sendError, Auths, axios } from '../../utils';
import { Group, Workspace, User, Account } from '../models';
import { Request, Response, NextFunction } from 'express';
import { UsersService, WorkspaceService } from '../services';
import http from 'axios';

// User Service Instance
const usersService = new UsersService();

const workspaceService = new WorkspaceService();

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
                    { _workspace: workspaceId },
                    { role: { $ne: 'guest' }},
                ]
            }).countDocuments();
            // Add company members count
            workspace.company_members_count = membersCount;

            // Workspace Company Members Count
            const guestsCount = await User.find({
                $and: [
                    { _workspace: workspaceId },
                    { role: { $eq: 'guest' }},
                ]
            }).countDocuments();

            // Add company members count
            workspace.guests_count = guestsCount;


            // If unable to find the workspace
            if (!workspace) {
                return sendError(res, new Error('Unable to fetch the workspace details, as the workspaceId was invalid!'), 'Unable to fetch the workspace details, as the workspaceId was invalid!', 404);
            }

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
     * @param { body: { newWorkspace, accountData } }req 
     * @param res 
     * @param next 
     * 
     * It performs the following functionalities:
     * 1. Set User´s Domain.
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
            // Prepare workspace data before creation
            const { newWorkspace, accountData } = req.body;

            // Pass user email domain to allowed domains
            const userEmailDomain = accountData.email.split('@')[1];
            newWorkspace.allowed_domains = [userEmailDomain];
            newWorkspace.access_code = await auths.generateWorkspaceAccessCode();
            newWorkspace.owner_first_name = accountData.first_name;
            newWorkspace.owner_last_name = accountData.last_name;
            newWorkspace.owner_email = accountData.email;
            newWorkspace.management_private_api_key = await auths.generateMgmtPrivateApiKey();

            // Create new workspace
            const workspace = await Workspace.create(newWorkspace);

            // Error creating workspace
            if (!workspace) {
                return sendError(res, new Error('Unable to create the workspace, some unexpected error occured!'), 'Unable to create the workspace, some unexpected error occured!', 500);
            }

            // Prepare new user data
            const newUser = {
                _account: accountData._id,
                email: accountData.email,
                first_name: accountData.first_name,
                last_name: accountData.last_name,
                full_name: `${accountData.first_name} ${accountData.last_name}`,
                workspace_name: newWorkspace.workspace_name,
                company_name: newWorkspace.company_name,
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

            // Send new workspace confirmation email
            http.post(`${process.env.MAILING_SERVER_API}/new-workspace`, {
                workspace: workspaceUpdate
            })

            // Send new workspace and user to the mgmt portal
            let workspaceMgmt = {
                _id: workspace._id,
                company_name: newWorkspace.company_name,
                workspace_name: newWorkspace.workspace_name,
                owner_email: accountData.email,
                owner_first_name: accountData.first_name,
                owner_last_name: accountData.last_name,
                _owner_remote_id: user._id,
                environment: process.env.DOMAIN,
                num_members: 1,
                num_invited_users: 0,
                num_groups: 1,
                created_date: workspace.created_date,
                access_code: workspace.access_code,
                management_private_api_key: workspace.management_private_api_key,
            }
            let userMgmt = {
                _id: user._id,
                _account_id: accountData._id,
                active: user.active,
                email: accountData.email,
                password: accountData.password,
                first_name: user.first_name,
                last_name: user.last_name,
                _remote_workspace_id: workspace._id,
                workspace_name: workspace.workspace_name,
                environment: process.env.DOMAIN,
                created_date: user.created_date
            }

            axios.post(`${process.env.MANAGEMENT_URL}/api/workspace/add`, {
                API_KEY: workspace.management_private_api_key,
                workspaceData: workspaceMgmt,
                userData: userMgmt,
            })

            // Send the status 200 response
            return res.status(200).json({
                message: 'Workspace created!',
                token: token,
                user: userUpdate,
                workspace: workspace
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
            if (JSON.stringify(user) == JSON.stringify({}) || JSON.stringify(req.body) == JSON.stringify({})) {
                return res.status(400).json({
                    message: 'Bad request as the request body was empty!'
                });
            }

            let addInvite = true;
            const account = await Account.findOne({ email: user.email });

            if (account) {
                let userDB = await User.findOne({ _account: account._id, _workspaces: user.workspaceId });

                if (userDB && user.type == 'group') {
                    // if the user already exists just add it to the group

                    // Add new user to group
                    const groupUpdate = await Group.findOneAndUpdate({
                        _id: user.groupId
                    }, {
                        $push: {
                            _members: userDB._id
                        },
                        $inc: { members_count: 1 }
                    });

                    // Error updating the group
                    if (!groupUpdate) {
                        return sendError(res, new Error(`Unable to update the group, some unexpected error occured!`), `Unable to update the group, some unexpected error occured!`, 500);
                    }

                    // Add group to user's groups
                    userDB = await User.findByIdAndUpdate({
                        _id: userDB._id
                    }, {
                        $push: {
                            _groups: user.groupId
                        }
                    });

                    addInvite = false;
                }
            }
            
            let workspace = await Workspace.findOne({
                $and: [
                    { _id: user.workspaceId }
                ]
            }).select('workspace_name access_code allowed_domains');

            if (addInvite) {
                // Add user to invite users only when is a group invite
                await usersService.inviteUserToJoin(user.email, user.workspaceId, user.type, user.groupId)
            }

            // Send signup invite to user
            http.post(`${process.env.MAILING_SERVER_API}/invite-user`, {
                data: {
                    from: req['userId'],
                    email: user.email,
                    access_code: workspace.access_code,
                    workspace: workspace.workspace_name,
                    type: user.type,
                    groupId: user.groupId
                }
            });

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

            await workspaceService.remove(workspaceId, true);

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace Deleted.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for adding a new custom field for the particular workspace
     * @param { customFiel } req 
     * @param res 
     */
    async addCustomField(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { workspaceId } = req.params;

        // Fetch the newCustomField from fileHandler middleware
        const newCustomField = req.body['newCustomField'];

        try {

            // Find the workspace and add a new custom field
            const workspace = await Workspace.findByIdAndUpdate({
                _id: workspaceId
            }, {
                $push: { "profile_custom_fields": newCustomField }
            }, {
                new: true
            }).select('profile_custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Workspace custom fields updated!',
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches the custom fields of the workspace corresponding to the @constant workspaceId 
     * @param req - @constant workspaceId
     */
    async getCustomFields(req: Request, res: Response) {
        try {

            const { workspaceId } = req.params;

            // Find the workspace based on the workspaceId
            const workspace = await Workspace.findOne({
                _id: workspaceId
            }).select('profile_custom_fields').lean();

            // Check if workspace already exist with the same workspaceId
            if (!workspace) {
                return sendError(res, new Error('Oops, workspace not found!'), 'Workspace not found, Invalid workspaceId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Workspace found!',
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    async removeCustomField(req: Request, res: Response, next: NextFunction) {
        // Fetch the workspaceId & fieldId
        const { workspaceId, fieldId } = req.params;

        try {
            // Find the workspace and remove a respective custom field
            const workspace = await Workspace.findByIdAndUpdate({
                _id: workspaceId
            },
                {
                    $pull:
                    {
                        profile_custom_fields: {
                            _id: fieldId
                        }
                    }
                }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Workspace custom fields updated!',
                workspace: workspace
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async addCustomFieldValue(req: Request, res: Response, next: NextFunction) {

        // Fetch the workspaceId
        const { workspaceId } = req.params;

        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body['fieldId'];
        const value = req.body['value'];

        try {
            // Find the custom field in a workspace and add the value
            const workspace = await Workspace.findByIdAndUpdate({
                _id: workspaceId
            }, {
                $push: { "profile_custom_fields.$[field].values": value }
            }, {
                arrayFilters: [{ "field._id": fieldId }],
                new: true
            }).select('profile_custom_fields').lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Workspace custom fields updated!',
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async removeCustomFieldValue(req: Request, res: Response, next: NextFunction) {

        // Fetch the workspaceId
        const { workspaceId } = req.params;

        // Find the custom field in a workspace and remove the value
        const fieldId = req.body['fieldId'];
        const value = req.body['value'];

        try {
            // Find the workspace and remove a custom field value
            const workspace = await Workspace.findByIdAndUpdate({
                _id: workspaceId
            }, {
                $pull: { "profile_custom_fields.$[field].values": value }
            }, {
                arrayFilters: [{ "field._id": fieldId }],
                new: true
            }).select('profile_custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Workspace custom fields updated!',
                workspace: workspace
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async getShuttleGroups(req: Request, res: Response, next: NextFunction) {
        try {

            const { workspaceId } = req.params;
            const { groupId } = req.query;

            // If either workspaceId or userId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide both workspaceId and userId as the query parameter!'
                });
            }
            
            let groups;
            if (groupId != 'null') {
                // Finding groups for the user of which they are a part of
                groups = await Group.find({
                    $and: [
                        { group_name: { $ne: 'personal' } },
                        { group_name: { $ne: 'private' } },
                        { _workspace: workspaceId, },
                        { shuttle_type: true },
                        { _shuttle_section: { $ne: null } },
                        { _id: { $ne: groupId } }
                    ]
                })
                .sort('group_name')
                .lean() || [];
            } else {
                // Finding groups for the user of which they are a part of
                groups = await Group.find({
                    $and: [
                        { group_name: { $ne: 'personal' } },
                        { group_name: { $ne: 'private' } },
                        { _workspace: workspaceId, },
                        { shuttle_type: true },
                        { _shuttle_section: { $ne: null } }
                    ]
                })
                .sort('group_name')
                .lean() || [];
            }

            // If there are no groups then we send error response
            if (!groups) {
                return sendError(res, new Error('Oops, no groups found!'), 'Group not found, Invalid workspaceId or userId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `${groups.length} groups found.`,
                groups
            });
        } catch (err) {
            return sendError(res, err);
        }
    };
}