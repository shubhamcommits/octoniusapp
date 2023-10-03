import { CommonService } from '.';
import { Account, Group, Lounge, Story, User, Workspace } from '../models';
import http from "axios";
import { axios } from '../../utils';

const commonService = new CommonService();

/*  ===============================
 *  -- Workspace Service --
 *  ===============================
 */
export class WorkspaceService {

    /**
     * This function is used to remove a workspace
     * @param workspaceId
     * @param workspaceName
     */
    async updateWorkspaceName(workspaceId: string, workspaceName: string) {
      try {
  
        let updatedWorkspace = await Workspace.findOneAndUpdate(
            { _id: workspaceId },
            { $set: { workspace_name: workspaceName }},
            { new : true })
            .lean();

        await User.updateMany({
                _workspace: workspaceId
            }, {
                $set: { workspace_name: workspaceName }
            });
        
        return updatedWorkspace;
  
      } catch (err) {
        throw (err);
      }
    };
    
    /**
     * This function is used to remove a workspace
     * @param workspaceId
     * @param callMgmtPortal This property is used to identify if the call to the method is already made from the mgmt portal, so then it is not needed to call it again.
     */
    async remove(workspaceId: string, callMgmtPortal: boolean) {
        try {

            // Remove the workspace from user´s account
            let users = await User.find({_workspace: workspaceId}).select('_account').lean();
            users.forEach(async user => {
                // Count the number of workspces for the account
                let accountUpdate = await Account.findById(user._account);
                const numWorkspaces = accountUpdate._workspaces.length;

                if (numWorkspaces < 2) {
                    // If account only has one workspace, the account is removed
                    accountUpdate = await Account.findByIdAndDelete(user._account);
                } else {
                    // If account has more than one workspaces, the workspace is removed from the account
                    accountUpdate = await Account.findByIdAndUpdate({
                            _id: user._account
                        }, {
                            $pull: {
                                _workspaces: workspaceId
                            }
                        });
                }
            });

            // Delete the users related
            await User.deleteMany({_workspace: workspaceId});

            // Delete the groups
            const groups = await Group.find({ _workspace: workspaceId });
            groups.forEach(async group => {
                await commonService.removeGroup(group._id, workspaceId);
            });

            // Delete the lounges related
            await Lounge.deleteMany({_workspace: workspaceId});

            // Delete stories
            await Story.deleteMany({_workspace: workspaceId});

            // Delete the workspace
            const workspace = await Workspace.findByIdAndDelete(workspaceId);

            if (callMgmtPortal) {
                // Remove the workspace in the mgmt portal
                axios.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspaceId}`, {
                    data: {
                        API_KEY: workspace.management_private_api_key
                    }
                });
            }
        } catch (err) {
            throw (err);
        }
    };
}
