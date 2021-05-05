import { sendError } from '../../utils';
import { Workspace } from '../models';
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../services';
import http from 'axios';

const workspaceService = new WorkspaceService();

export class ManagementControllers {
    /**
      * This function add's the domain to the allowed_domain set which allows those specific domains to signup to the workspace
      * @param { userId, params: { workspaceId }, body: { domain } }req 
      * @param res 
      * @param next 
      */
    async setFlamingo(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { params: { workspaceId } } = req;

            // If workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                });
            }

            // Check if the workspace exists 
            let workspace: any = await Workspace.findById(workspaceId).select('allowed_modules').lean();

            // Unable to update the workspace
            if (!workspace) {
                return sendError(res, new Error('Unable to find a workspace with the provided Id'), 'Unable to find a workspace with the provided Id', 404);
            }

            workspace = await Workspace.findOneAndUpdate({
                _id: workspaceId
            }, {
                $set: {
                    'allowed_modules.flamingo': !workspace?.allowed_modules?.flamingo || false
                }
            }, {
                new: true
            });

            // Unable to update the workspace
            if (!workspace) {
                return sendError(res, new Error('Unable to update the workspace, reason might be - Invalid workspaceId'), 'Unable to update the workspace, reason might be - Invalid workspaceId', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Flamingo availability has been set to ${workspace.allowed_modules.flamingo}!`,
                workspace: workspace
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
    async removeWorkspace(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { workspaceId } } = req;

            if (!workspaceId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            await workspaceService.remove(workspaceId.toString());

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace Deleted.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}

