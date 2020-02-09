import { sendError } from '../../utils';
import { Workspace } from '../models';
import { Request, Response, NextFunction } from 'express';

export class WorkspaceController {

    /**
     * This function checks whether the workspace name is available to create or not
     * @param { body.workspace_name }req 
     * @param res 
     * @param next 
     */
    async checkWorkspaceAvailability(req: Request, res: Response, next: NextFunction) {
        try {

            let { workspace_name } = req.body;

            // Find the workspace on the basis of workspace_name
            const workspace = await Workspace.findOne({ workspace_name: workspace_name });

            // Workspace name already exists
            if (workspace) {
                return sendError(res, new Error('This Workspace name has already been taken, please pick another name!'), 'This Workspace name has already been taken, please pick another name!', 409);

            } else {

                // Send the status 200 response 
                return res.status(200).json({
                    message: 'This Workspace name is available!',
                    workspace: workspace
                });
            }

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };
}