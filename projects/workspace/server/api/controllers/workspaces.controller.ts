import { sendError, PasswordHelper, Auths } from '../../utils';
import { Group, Workspace, User } from '../models';
import { Request, Response, NextFunction } from 'express';
import http from 'axios';

// Password Helper Class
const passwordHelper = new PasswordHelper();

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
     * This function is responsible for creating a new workspace
     * @param {body: { owner_first_name, owner_last_name, owner_password, owner_email, workspace_name, company_name } }req 
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
            const user = await User.create(newUser);

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
                workspace_name: workspaceUpdate.workspace_name
            };

            // Create new global group
            const group = await Group.create(globalGroup);

            // Error creating global group
            if (!group) {
                return sendError(res, new Error('Unable to create the global group, some unexpected error occured!'), 'Unable to create the global group, some unexpected error occured!', 500);
            }

            // Add Global group to user's groups
            const userUpdate = await User.findByIdAndUpdate({
                _id: user._id
            }, {
                $push: {
                    _groups: group
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
                _admins: user._id,
                workspace_name: workspaceUpdate.workspace_name
            };

            // Check if the group exist or not
            const groupExist = await Group.findOne({
                group_name: newGroupData.group_name,
                _admins: newGroupData._admins,
                workspace_name: newGroupData.workspace_name
            });

            // Send error if the personal group exists
            if (!!groupExist) {
                return sendError(res, new Error('Group name already taken, please choose another name!'), 'Group name already taken, please choose another name!', 409);
            } else {

                // Create personal group
                const group = await Group.create(newGroupData);

                // Add personal group to user's groups
                await User.findByIdAndUpdate({
                    _id: newGroupData._admins,
                    _workspace: newGroupData._workspace
                }, {
                    $push: {
                        _groups: group
                    }
                }, {
                    new: true
                });
            }

            // Generate new token and logs the auth record
            let token = await auths.generateToken(userUpdate, workspaceUpdate.workspace_name);

            // Send signup confirmation email using mailing microservice
            await http.post('http://localhost:2000/api/mails/sign-up', {
                user: userUpdate
            })

            // Send new workspace confirmation email
            await http.post('http://localhost:2000/api/mails/new-workspace', {
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
     * This function add's the domain to the allowed_domain set which allows those specific domains to signup to the workspace
     * @param { userId, params: { workspaceId }, body: { domain } }req 
     * @param res 
     * @param next 
     */
    async addDomain(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { params: { workspaceId }, body: { domain } } = req;

            // userId comes from the authorization
            const userId = req['userId'];

            // Add the domain to the 'allowed_domains' set 
            const workspace: any = await Workspace.findOneAndUpdate({
                $and: [
                    { _id: workspaceId },
                    { _owner: userId }
                ]
            }, {
                $addToSet: {
                    allowed_domains: domain
                }
            }, {
                new: true
            }).select('allowed_domains');

            // Unable to update the workspace
            if (!workspace) {
                return sendError(res, new Error('Unable to update the workspace, reason might be - Invalid workspaceId or user in not the workspace owner'), 'Unable to update the workspace, reason might be - Invalid workspaceId or user in not the workspace owner', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "New domain was added to workspace's allowed domains!",
                allowedDomains: workspace.allowed_domains
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of allowed domains from which users can sign-up
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
    async getDomains(req: Request, res: Response, next: NextFunction) {
        try {

            const { workspaceId } = req.params;

            // Find the list of domains
            const domains: any = await Workspace.findOne({ _id: workspaceId })
                .select('allowed_domains')

            // Unable to find the domains
            if (!domains) {
                return sendError(res, new Error('Unable to fetch the data as the workspaceId is invalid!'), 'Unable to fetch the data as the workspaceId is invalid!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${domains.allowed_domains.length} domains allowed on this workspace!`,
                domains: domains.allowed_domains
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for removing the domain from the allowed_domains list and disabling the users who are signed up with those domain's email
     * @param { userId, { params: { workspaceId, domain } } }req 
     * @param res 
     * @param next 
     * 
     * It performs the following functionalities:
     * 1. Removes the domain from the allowed domain list.
     * 2. Updates the status of all the users with the concerned domain as disabled.
     * 3. Fetch the list of disabled users along with their userIds.
     * 4. Remove all the userIds from the workspace members field.
     * 5. Update all the groups from workspace to remove all the members inside them.
     */
    async removeDomain(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { workspaceId, domain } } = req;

            const userId = req['userId'];

            // Remove domain from domains array
            const workspace: any = await Workspace.findOneAndUpdate({
                $and: [
                    { _id: workspaceId },
                    { _owner: userId }
                ]
            }, {
                $pull: {
                    allowed_domains: domain
                }
            }, {
                new: true
            });

            // Unable to remove the domain from domains list
            if (!workspace) {
                return sendError(res, new Error('Unable to remove the domain from the allowed domains list as due to Invalid workspaceId or user in not the workspace owner'), 'Unable to remove the domain from the allowed domains list as due to Invalid workspaceId or user in not the workspace owner', 404);
            }

            // Disable all users from that domain from that workspace
            await User.updateMany({
                $and: [
                    { workspace_name: workspace.workspace_name },
                    { email: { $regex: new RegExp(domain, 'i') } }
                ]
            }, {
                $set: { active: false }
            });

            // Fetch the list of workspace members that must be deleted
            const membersToRemove = await User.find({
                $and: [
                    { _workspace: workspace._id },
                    { email: { $regex: new RegExp(domain, 'i') } }
                ]
            })  .select('first_name last_name email')
                .lean();

            // Generate an array of user ids
            const idsToRemove = [];

            membersToRemove.forEach((member) => {
                // Don't push workspace owner
                if (!workspace._owner.equals(member._id)) {
                    idsToRemove.push(member._id);
                }
            })

            // Remove users ids from workspace's members & invited users
            const workspaceUpdated: any = await Workspace.findOneAndUpdate({
                $and: [
                    { _id: workspaceId },
                    { _owner: userId }
                ]
            }, {
                $pullAll: {
                    members: idsToRemove,
                    invited_users: idsToRemove
                }
            }, {
                new: true
            }).select('allowed_domains');

            // Remove users from all group's _members & _admins
            await Group.update({
                $or: [
                    { _members: req.params.userId },
                    { _admins: req.params.userId }
                ]
            }, {
                $pullAll: {
                    _members: idsToRemove,
                    _admins: idsToRemove
                }
            }, {
                multi: true
            });

            // Send the status 200 response
            return res.status(200).json({
                message: `Domain removed from workspace. All the ${membersToRemove.length} user(s) from this domain are disabled!`,
                allowedDomains: workspaceUpdated.allowed_domains,
                membersRemoved: membersToRemove
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}