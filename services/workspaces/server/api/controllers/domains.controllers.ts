import { sendError } from '../../utils';
import { Group, Workspace, User } from '../models';
import { Request, Response, NextFunction } from 'express';

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
                    { email: { $regex: new RegExp(domain.toString(), 'i') } }
                ]
            }, {
                $set: { active: false }
            });

            // Fetch the list of workspace members that must be deleted
            const membersToRemove = await User.find({
                $and: [
                    { _workspace: workspace._id },
                    { email: { $regex: new RegExp(domain.toString(), 'i') } }
                ]
            }).select('first_name last_name email')
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

