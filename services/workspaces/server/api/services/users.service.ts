import { Group, User, Workspace } from "../models";
import moment from "moment";
import http from "axios";

export class UsersService {

    /**
     * This function is responsible for inviting a user to a workplace
     * @param {string} email 
     * @param {string} workspace_name 
     */
    async inviteUserToJoin(email: string, workspace_name: string, type: string, group_name?: string) {

        // Find if the user already exist in the workplace
        let user = await User.findOne(
            { email: email, workspace_name: workspace_name, invited: true, active: false}
        )

        // Find the workspace
        let workspace = await Workspace.findOne({ workspace_name: workspace_name })

        // Send Mail check
        let send = false

        if (user) {

            // As we found that user was disabled, then enable them accordingly.
            user = await User.findOneAndUpdate(
                { email: email },
                { $set: { active: true } },
                { new: true }
            )
        }   else {

            // Invited User Object
            let invited_user: any = {
                email: email,
                workspace_name: workspace_name,
                type: type,
                invited_date: moment().format()
            }

            // If type is 'group' invite
            if(type == 'group' && group_name != undefined){

                // Find the group which exist in the present workspace
                let group: any = await Group.findOne({ group_name: group_name, workspace_name: workspace_name })

                // Add the property to `_group`
                invited_user._group = group._id

            }

            // check if email has already been invited
            let emailExist = await Workspace.findOne({ "invited_users.email": email })

            // Update the workspace and push into the invited_user data
            if(!emailExist){
                workspace = await Workspace.findOneAndUpdate(
                    { workspace_name: workspace_name },
                    { $push: { invited_users: invited_user } },
                    { new: true }
                ).select('invited_users')

                // Return the send
                send = true
            }

        }

        // Return send call
        return send

    }

}