import { Group, User, Workspace } from "../models";
import moment from "moment";
import http from "axios";

export class UsersService {

    /**
     * This function is responsible for inviting a user to a workplace
     * @param {string} email 
     * @param {string} workspaceId 
     * @param {string} type 
     * @param {string} groupId 
     */
    async inviteUserToJoin(email: string, workspaceId: string, type: string, groupId: string) {

        // Find if the user already exist in the workplace
        let user = await User.findOne({ 
            email: email,
            _workspace: workspaceId,
            active: false
        });

        if (user) {
            // As we found that user was disabled, then enable them accordingly.
            user = await User.findOneAndUpdate(
                { email: email },
                { $set: { active: true } },
                { new: true }
            );
        } else {
            // Invited User Object
            let invited_user: any = {
                email: email,
                type: type,
                invited_date: moment().format()
            };

            let query = {};

            // If type is 'group' invite
            if(type == 'group' && groupId && groupId != '') {
                // Add the property to `_group`
                invited_user._group = [groupId];

                // check if email has already been invited
                query = {
                    "_id": workspaceId,
                    "invited_users.email": email,
                    "invited_users.type": type,
                    "invited_users._group": groupId
                };
            } else if (type == 'workspace') {
                query = {
                    "_id": workspaceId,
                    "invited_users.email": email,
                    "invited_users.type": type
                }
            }

            // check if email has already been invited
            let emailExist = await Workspace.findOne(query);

            // Update the workspace and push into the invited_user data
            if (!emailExist) {
                await Workspace.findOneAndUpdate(
                    { _id: workspaceId },
                    { $push: { invited_users: invited_user } },
                    { new: true }
                ).select('invited_users');
            }
        }
    }

}