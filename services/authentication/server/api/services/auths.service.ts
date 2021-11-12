import { token } from 'morgan';
import { Auths, axios, PasswordHelper, sendError } from '../../utils';
import { Account, Group, User, Workspace } from '../models';

// Authentication Utilities Class
const auths = new Auths();

// Password Helper Class
const passwordHelper = new PasswordHelper();

/*  ===============================
 *  -- AuthsService Service --
 *  ===============================
 */
export class AuthsService {

    MANAGEMENT_BASE_API_URL = process.env.MANAGEMENT_URL + '/api';

    async signUp(userData: any) {
      try {
        if (userData.password) {
          // Encrypting user password
          const passEncrypted: any = await passwordHelper.encryptPassword(userData.password);

          // If we are unable to encrypt the password and store into the server
          if (!passEncrypted.password) {
              throw new Error('Unable to encrypt the password to the server');
          }

          // Updating the password value with the encrypted password
          userData.password = passEncrypted.password;
        }

        // Adding _workspace property to userData variable
        userData._workspaces = [];

        // Create new user with all the properties of userData
        let account: any = await Account.create(userData);

        return account;
      } catch (error) {
        throw new Error('Unable to create the account, some unexpected error occurred!');
      }
    }

    async joinWorkplace(accountData: any, workspace: any) {
        let token, user;
        try {
            // Add workspace to user account
            const accountUpdate: any = await Account.findByIdAndUpdate({
                _id: accountData._id
            }, {
                $push: {
                    _workspaces: workspace
                }
            }, {
                new: true
            })

            // Error updating the account
            if (!accountUpdate) {
                throw new Error('Unable to update the account, some unexpected error occurred!');
            }

            // Find if the user already exist in the workplace, but is inactive
            let user = await User.findOne({
                email: accountData.email,
                workspace_name: workspace.workspace_name,
                active: false
            });

            if (user) {
                // As we found that user was disabled, then enable them accordingly.
                user = await User.findOneAndUpdate(
                    { email: accountData.email },
                    { $set: { active: true } },
                    { new: true }
                );
            } else {

                let groups = workspace.invited_users
                    .filter(invite => (invite.email == accountData.email && invite.type == 'group'))
                    .map(invite => invite._group);

                if (groups && groups.length > 0) {

                    let userData: Object = {
                        _account: accountUpdate._id,
                        email: accountUpdate.email,
                        first_name: accountData.first_name,
                        last_name: accountData.last_name,
                        full_name: `${accountData.first_name} ${accountData.last_name}`,
                        _workspace: workspace._id,
                        workspace_name: workspace.workspace_name,
                        role: 'guest'
                    };

                    // Create new user with all the properties of userData
                    user = await User.create(userData);

                    for (let i = 0; i < groups.length; i++) {
                        // Add new user to group
                        const groupUpdate = await Group.findOneAndUpdate({
                            _id: groups[i]._id || groups[i]
                        }, {
                            $push: {
                                _members: user._id
                            },
                            $inc: { members_count: 1 }
                        });
    
                        // Error updating the group
                        if (!groupUpdate) {
                            throw new Error('Unable to update the account, some unexpected error occurred!');
                        }
    
                        // Add group to user's groups
                        user = await User.findByIdAndUpdate({
                            _id: user._id
                        }, {
                            $push: {
                                _groups: groups[i]._id || groups[i]
                            }
                        });
                    }
                } else {
                    let userData: Object = {
                        _account: accountUpdate._id,
                        email: accountUpdate.email,
                        first_name: accountData.first_name,
                        last_name: accountData.last_name,
                        full_name: `${accountData.first_name} ${accountData.last_name}`,
                        _workspace: workspace._id,
                        workspace_name: workspace.workspace_name,
                        role: 'member'
                    };

                    // Create new user with all the properties of userData
                    user = await User.create(userData);
                }

                // Error creating the new user
                if (!user) {
                    throw new Error('Unable to update the account, some unexpected error occurred!');
                }

                // If user is invite, does not have access to global
                if (user['role'] != 'guest') {
                    // Add new user to workspace's group
                    const groupUpdate = await Group.findOneAndUpdate({
                        group_name: 'Global',
                        _workspace: workspace._id
                    }, {
                        $push: {
                            _members: user._id
                        },
                        $inc: { members_count: 1 }
                    });

                    // Error updating the group
                    if (!groupUpdate) {
                        throw new Error('Unable to update the account, some unexpected error occurred!');
                    }

                    // Add group to user's groups
                    user = await User.findByIdAndUpdate({
                        _id: user._id
                    }, {
                        $push: {
                            _groups: groupUpdate._id,
                            'stats.favorite_groups': groupUpdate._id
                        }
                    }, {
                        new: true
                    });
                }

                // Error updating the user
                if (!user) {
                    throw new Error('Unable to update the account, some unexpected error occurred!');
                }

                // personalGroupData variable to create group for my workplace
                const personalGroupData = {
                    group_name: 'personal',
                    _workspace: workspace._id,
                    _admins: [user._id],
                    workspace_name: workspace.workspace_name
                };

                // Check if personal group already exist
                const personalGroup = await Group.findOne({
                    group_name: personalGroupData.group_name,
                    _admins: personalGroupData._admins,
                    workspace_name: personalGroupData.workspace_name,
                });

                // Send Error response if 'personal' group already exist
                if (!!personalGroup) {
                    throw new Error('Unable to update the account, some unexpected error occurred!');
                } else {

                    // Create new personal group
                    let group = await Group.create(personalGroupData);

                    const default_CF = {
                        title: 'Priority',
                        name: 'priority',
                        values: ['Low', 'Medium', 'High']
                    };
        
                    // Find the group and update their respective group avatar
                    group = await Group.findByIdAndUpdate({
                        _id: group._id
                    }, {
                        //custom_fields: newCustomField
                        $push: { "custom_fields": default_CF }
                    }, {
                        new: true
                    });

                    // Add personal group to user's groups
                    user = await User.findByIdAndUpdate({
                        _id: personalGroupData._admins,
                        _workspace: personalGroupData._workspace
                    }, {
                        $push: {
                            _groups: group._id
                        },
                        $set: {
                            _private_group: group
                        }
                    }, {
                        new: true
                    });
                }

                // Add new user to workspace members and remove user email
                workspace = await Workspace.findByIdAndUpdate({
                    _id: workspace._id
                }, {
                    $push: {
                        members: user._id
                    }
                }, {
                    new: true
                })

                // Error updating the Workspace and removing the user email
                if (!workspace) {
                    throw new Error('Unable to update the account, some unexpected error occurred!');
                }
            }

            // Generate new token and logs the auth record
            let token = await auths.generateToken(user, workspace.workspace_name);

            // Send signup confirmation email
            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/join-workspace`, {
                API_KEY: workspace.management_private_api_key,
                user: user
            });

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspace._id }
            ] }).countDocuments();
            
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

            // Send user to the mgmt portal
            let userMgmt = {
                _id: user._id,
                _account_id: accountUpdate._id,
                active: user['active'],
                email: accountUpdate.email,
                password: accountUpdate.password,
                first_name: user['first_name'],
                last_name: user['last_name'],
                _remote_workspace_id: workspace._id,
                workspace_name: workspace.workspace_name,
                environment: process.env.DOMAIN,
                created_date: user['created_date']
            }
            axios.post(`${process.env.MANAGEMENT_URL}/api/user/add`, {
                API_KEY: workspace.management_private_api_key,
                workspaceId: workspace._id,
                userData: userMgmt
            }).then().catch(err => console.log(err));

            const mailUser = {
                first_name: user['first_name'],
                email: accountUpdate.email,
                workspace_name: workspace.workspace_name
            }
            // Send signup confirmation email
            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/sign-up`, {
                user: mailUser
            });
        } catch (err) {
            throw (err);
        }

        return {
            token: token,
            user: user,
            workspace: workspace
        };
    }
}