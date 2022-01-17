import { sendError, axios } from '../../utils';
import { Group, Workspace, User, Account } from '../models';
import { Request, Response, NextFunction } from 'express';
import http from 'axios';
import moment from 'moment';

export class DomainsControllers {
    /**
      * This function add's the domain to the allowed_domain set which allows those specific domains to signup to the workspace
      * @param { userId, params: { workspaceId }, body: { domain } }req 
      * @param res 
      * @param next 
      */
    async addDomain(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { query: { workspaceId }, body: { domain } } = req;

            // If either workspaceId or domain is null or not provided then we throw BAD REQUEST 
            if (!workspaceId || !domain) {
                return res.status(400).json({
                    message: 'Please provide both workspaceId and domain as the query parameter!'
                })
            }

            // userId comes from the authorization
            const userId = req['userId'];

            // Add the domain to the 'allowed_domains' set 
            const workspace: any = await Workspace.findOneAndUpdate({
                $and: [
                    { _id: workspaceId }
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
                return sendError(res, new Error('Unable to update the workspace, reason might be - Invalid workspaceId'), 'Unable to update the workspace, reason might be - Invalid workspaceId', 404);
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

            const { workspaceId } = req.query;

            // If either workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            // Find the list of domains
            const domains: any = await Workspace.findById({ _id: workspaceId })
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

            const { query: { workspaceId }, params: { domain } } = req;

            // If either workspaceId or domain is null or not provided then we throw BAD REQUEST 
            if (!workspaceId || !domain) {
                return res.status(400).json({
                    message: 'Please provide both workspaceId and domain as the query parameter!'
                })
            }

            const userId = req['userId'];

            // Remove domain from domains array
            const workspace: any = await Workspace.findOneAndUpdate({
                $and: [
                    { _id: workspaceId }
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
                return sendError(res, new Error('Unable to remove the domain from the allowed domains list as due to Invalid workspaceId'), 'Unable to remove the domain from the allowed domains list as due to Invalid workspaceId', 404);
            }

            // Disable all users from that domain from that workspace
            await User.updateMany({
                $and: [
                    { workspace_name: workspace.workspace_name },
                    { email: { $regex: new RegExp(domain.toString(), 'i') } }
                ]
            }, {
                $set: { active: false }
            });

            // Remove the workplaces from the accounts with the workplace
            await Account.updateMany({
                $and: [
                    { workspace_name: workspace.workspace_name },
                    { email: { $regex: new RegExp(domain.toString(), 'i') } }
                ]
            }, {
                $pull: {
                    _workspaces: workspaceId
                }
            });

            // Fetch the list of workspace members that must be deleted
            const membersToRemove = await User.find({
                $and: [
                    { _workspace: workspace._id },
                    { email: { $regex: new RegExp(domain.toString(), 'i') } }
                ]
            }).select('first_name last_name email integrations')
                .lean();

            // Generate an array of user ids
            const idsToRemove = [];

            membersToRemove.forEach(async (member) => {
                // Don't push workspace owner
                if (!workspace._owner.equals(member._id)) {
                    idsToRemove.push(member._id);

                    // Remove the user from the mgmt portal
                    const user: any = await User.find({_id: member}).lean()
                    let userMgmt = {
                        _id: user._id,
                        _account_id: user._account._id,
                        active: false,
                        email: user._account.email,
                        password: user._account.password,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        _remote_workspace_id: user._workspace,
                        workspace_name: user.workspace_name,
                        environment: process.env.DOMAIN,
                        created_date: user.created_date
                    }
    
                    axios.put(`${process.env.MANAGEMENT_URL}/api/user/${userMgmt._id}/update`, {
                        API_KEY: workspace.management_private_api_key,
                        workspaceId: workspace._id,
                        userData: userMgmt
                    });
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

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();
           
            // Remove users from all group's _members & _admins
            await Group.updateMany({
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

            // Send workspace to the mgmt portal
            // Count all the groups present inside the workspace
            const groupsCount: number = await Group.find({ $and: [
                { group_name: { $ne: 'personal' } },
                { _workspace: workspace._id }
            ]}).countDocuments();

            // Count all the users present inside the workspace
            const guestsCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspace._id },
                { role: 'guest'}
            ] }).countDocuments();

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
                access_code: workspace.access_code,
                management_private_api_key: workspace.management_private_api_key
            }
            axios.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                API_KEY: workspace.management_private_api_key,
                workspaceData: workspaceMgmt
            }).then().catch(err => console.log(err));

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

