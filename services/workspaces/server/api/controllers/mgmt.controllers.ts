import { sendError } from '../../utils';
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../services';
import { Group, User, Workspace } from '../models';
import moment from 'moment';

const workspaceService = new WorkspaceService();

export class ManagementControllers {


    /**
     * This function is responsible for fetching the information of the workspace for the mgmt portal
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
     async getWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { workspaceId } } = req;

            if (!workspaceId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            const workspace = await Workspace.findOne({_id: workspaceId}).lean();

            // Count all the groups present inside the workspace
            const groupsCount: number = await Group.find({ $and: [
                { group_name: { $ne: 'personal' } },
                { _workspace: workspace._id }
            ]}).countDocuments();

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();

            // Count all the users present inside the workspace
            const guestsCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspace._id },
                { role: 'guest'}
            ] }).countDocuments();

            let workspaceMgmt = {
                remote_id: workspace._id,
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

            // Find the user and delete them
            const usersMongo: any = await User.find({
                $and: [
                    { active: true },
                    { _workspace: workspaceId }
                ]
            }).select('first_name last_name active created_date')
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });

            const users: any[] = usersMongo.map(user => ({
                remote_id: user._id,
                _account_id: user._account._id,
                active: user.active,
                email: user._account.email,
                password: user._account.password,
                first_name: user.first_name,
                last_name: user.last_name,
                _remote_workspace_id: workspace._id,
                workspace_name: workspace.workspace_name,
                environment: process.env.DOMAIN,
                created_date: user.created_date
            }));

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Workspace information.',
                workspace: workspaceMgmt,
                users: users
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for deleting the workspace remotely from the mgmt portal
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

