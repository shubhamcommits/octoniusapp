import { sendError } from '../../utils';
import { Workspace } from '../models';
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../services';
import http from 'axios';

const workspaceService = new WorkspaceService();

export class ManagementControllers {

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

            await workspaceService.remove(workspaceId.toString(), false);

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace Deleted.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}

