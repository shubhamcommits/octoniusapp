import { Account, Group, User, Workspace } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError,PasswordHelper } from '../../utils';
import http from 'axios';
import moment from 'moment';

/*  ===================
 *  -- USER METHODS --
 *  ===================
 * */
// Password Helper Class
const passwordHelper = new PasswordHelper();

export class UsersControllers {

    /**
     * This function is responsible for fetching the current loggedIn user details
     * @param { userId }req 
     * @param res 
     * @param next 
     */
    async get(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        try {

            // Find the user based on the userId
            const user = await User.findOne({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            })
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });

            if (user['stats'] && user['stats']['favorite_groups']) {
                user['stats']['favorite_groups'].sort(function(a, b) {
                  return b.group_name - a.group_name;
                });
            }

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'User found!',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the account details of the current loggedIn user
     * @param { userId }req 
     * @param res 
     * @param next 
     */
    async getAccount(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        try {

            // Find the user based on the userId
            const user = await User.findOne({ _id: userId })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Account found!',
                account: user._account
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the current loggedIn user details
     * @param { params.userId }req 
     * @param res 
     * @param next 
     */
    async getOtherUser(req: Request, res: Response, next: NextFunction) {

        const { params: { userId } } = req;

        try {

            // Find the user based on the userId
            const user = await User.findOne({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            })
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });

            if (user && user['stats'] && user['stats']['favorite_groups']) {
                user['stats']['favorite_groups'].sort(function(a, b) {
                  return b.group_name - a.group_name;
                });
            }

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'User Details found!',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * 
     * @param { userId, body: { phone_number, mobile_number, company_name, current_position, company_join_date, bio } }req 
     * @param res 
     * @param next 
     */
    async edit(req: Request, res: Response, next: NextFunction) {

        // Request Body Data
        const { body } = req;

        // Current loggedIn userId
        const userId = req['userId'];

        try {

            let user: any = await User.findById({ _id: userId }).select('email').lean();
            
            if (body.email && body.first_name && body.last_name) {

                let account: any = await Account.findOne({
                    email: body.email
                }).select('email').lean();

                if (account && account.email != user.email) {
                    return sendError(res, new Error('The email already exist and assigned to other user, so it cannot be updated!'), 'The email already exist and assigned to other user, so it cannot be updated!', 404);
                }

                // Find the user and update it on the basis of the userId
                account = await Account.findOneAndUpdate({
                        email: user.email
                    }, {
                        $set: {
                            email: body.email,
                            first_name: body.first_name,
                            last_name: body.last_name
                        }
                    }, {
                        new: true
                    })
                    .select('_id email _workspaces first_name last_name created_date').lean();
    
                // If user not found
                if (!account) {
                    return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
                }
            }

            // Find the user and update it on the basis of the userId
            user = await User.findByIdAndUpdate({
                    _id: userId
                }, {
                    $set: body
                }, {
                    new: true
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            if (user['stats'] && user['stats']['favorite_groups']) {
                user['stats']['favorite_groups'].sort(function(a, b) {
                  return b.group_name - a.group_name;
                });
            }
    
            if (body.email) {
                user._account.email = body.email;
            }

            // Send user to the mgmt portal
            const workspace = await Workspace.find({
                _id: user._workspace
            }).select('management_private_api_key');

            let userMgmt = {
                _id: user._id,
                _account_id: user._account._id,
                active: user.active,
                email: user._account.email,
                password: user._account.password,
                first_name: user.first_name,
                last_name: user.last_name,
                _remote_workspace_id: user._workspace,
                workspace_name: user.workspace_name,
                environment: process.env.DOMAIN,
                created_date: user.created_date
            }

            http.put(`${process.env.MANAGEMENT_URL}/api/user/${userMgmt._id}/update`, {
                API_KEY: workspace.management_private_api_key,
                workspaceId: workspace._id,
                userData: userMgmt
            });

            // Send status 200 response
            return res.status(200).json({
                message: 'User Profile updated!',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for changing the password of the user
     * @param req 
     * @param res 
     * @param next 
     */
    async changePassword(req: Request, res: Response, next: NextFunction) {
        // Request Body Data
        const { body } = req;

        try {
            // Encrypting user password
            const passEncrypted: any = await passwordHelper.encryptPassword(body.password);

            // If we are unable to encrypt the password and store into the server
            if (!passEncrypted.password) {
                return sendError(res, new Error('Unable to encrypt the password to the server'), 'Unable to encrypt the password to the server, please try with a different password!', 401);
            }

            // Updating the password value with the encrypted password
            // Find the user and update it on the basis of the userId
            const account: any = await Account.findByIdAndUpdate({
                    _id: body._id
                }, {
                    $set: { password: passEncrypted.password }
                }, {
                    new: true
                })
                .select('_id email _workspaces first_name last_name created_date').lean();

            // If user not found
            if (!account) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Current loggedIn userId
            const userId = req['userId'];

            // Send user to the mgmt portal
            if (userId) {
                const user: any = await User.findById({
                    _id: userId
                })
                .select('_id active email first_name last_name workspace_name _workspace')
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

                const workspace = await Workspace.find({
                    _id: user._workspace
                }).select('management_private_api_key');

                let userMgmt = {
                    _id: user._id,
                    _account_id: user._account._id,
                    active: user.active,
                    email: user._account.email,
                    password: user._account.password,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    _remote_workspace_id: user._workspace,
                    workspace_name: user.workspace_name,
                    environment: process.env.DOMAIN,
                    created_date: user.created_date
                }

                http.put(`${process.env.MANAGEMENT_URL}/api/user/${userMgmt._id}/update`, {
                    API_KEY: workspace.management_private_api_key,
                    workspaceId: workspace._id,
                    userData: userMgmt
                });
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Password updated!'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for changing the role of the other user
     * @param req 
     * @param res 
     * @param next 
     */
    async transferOwnership(req: Request, res: Response, next: NextFunction) {

        const { userById ,userToId,workspaceId} = req.body;

        try {

            const userTo = await User.findById(userToId)
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });
            const userBY = await User.findById(userById);
            var workspace = await Workspace.findOneAndUpdate({
                    _id:workspaceId
                },
                {
                    owner_first_name: userTo._account.first_name,
                    owner_last_name:userTo._account.last_name,
                    owner_email: userTo._account.email,
                    _owner: userTo._id
                });

            userTo.workspace_name = workspace.workspace_name;
            userTo._workspace = workspace._id;
            userTo.role = 'owner';
            userBY.role = 'admin';

            await userTo.save();
            await userBY.save();

            // Send new workspace to the mgmt portal
            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ]}).countDocuments();

            // Count all the groups present inside the workspace
            const groupsCount: number = await Group.find({ $and: [
                { group_name: { $ne: 'personal' } },
                { _workspace: workspaceId }
            ]}).countDocuments();

            // Count all the users present inside the workspace
            const guestsCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId },
                { role: 'guest'}
            ] }).countDocuments();

            let workspaceMgmt = {
                _id: workspaceId,
                company_name: workspace.company_name,
                workspace_name: workspace.workspace_name,
                owner_email: userTo._account.email,
                owner_first_name: userTo._account.first_name,
                owner_last_name: userTo._account.last_name,
                _owner_remote_id: userToId,
                environment: process.env.DOMAIN,
                num_members: usersCount,
                num_invited_users: guestsCount,
                num_groups: groupsCount,
                created_date: workspace.created_date,
                access_code: workspace.access_code,
                management_private_api_key: workspace.management_private_api_key
            }

            http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                API_KEY: workspace.management_private_api_key,
                workspaceData: workspaceMgmt
            });
            
            // Send status 200 response
            return res.status(200).json({
                message: `Successfully Transfer ownership`,
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }



    /**
     * This function is responsible for changing the role of the other user
     * @param req 
     * @param res 
     * @param next 
     */
    async updateUserRole(req: Request, res: Response, next: NextFunction) {

        const { userId, role } = req.body;
        try {

            // find the user
            let user: any = await User.findOne({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            }, {
                role: role
            }, {
                new: true
            }).select('first_name last_name profile_pic role _workspace _account integrations');

            if (user.role == 'guest') {
                // Add new user to workspace's group
                const groupUpdate = await Group.findOneAndUpdate({
                    group_name: 'Global',
                    _workspace: user._workspace
                }, {
                    $push: {
                        _members: user._id
                    },
                    $inc: { members_count: 1 }
                });

                // Error updating the group
                if (!groupUpdate) {
                    return sendError(res, new Error(`Unable to update the group, some unexpected error occured!`), `Unable to update the group, some unexpected error occured!`, 500);
                }

                // Add group to user's groups
                user = await User.findByIdAndUpdate({
                    _id: user._id
                }, {
                    $push: {
                        _groups: groupUpdate._id,
                        'stats.favorite_groups': groupUpdate._id
                    },
                    role: role
                }, {
                    new: true
                });

                // Since user is already a member now, remove it from invite members of workspace
                const workspace = await Workspace.findOneAndUpdate(
                    { _id: user._workspace },
                    { $pull: { invited_users: { email: user._account.email }}},
                    { multi: true }
                );
            } else {
                // Find the user and update their respective role
                user = await User.findOneAndUpdate({
                    $and: [
                        { _id: userId },
                        { active: true }
                    ]
                }, {
                    role: role
                }, {
                    new: true
                }).select('first_name last_name profile_pic role _workspace integrations');
            }

            // Error updating the user
            if (!user) {
                return sendError(res, new Error('Unable to update the user, some unexpected error occured!'), 'Unable to update the user, some unexpected error occured!', 500);
            }

            let groupsUpdate;
            if(role === 'member') {
                groupsUpdate = await Group.updateMany({
                    _admins: userId
                }, {
                $pull: {
                    _admins: userId
                },
                $push: {
                    _members: userId
                },
                });
            } else {
                groupsUpdate = await Group.updateMany({
                    _members: userId
                }, {
                $pull: {
                    _members: userId
                },
                $push: {
                    _admins: userId
                },
                });
            }
            // Send status 200 response
            return res.status(200).json({
                message: `Role updated for user ${user.first_name}`,
                user: user,
                groupsUpdate
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for updating the image for the particular user
     * @param { userId, fileName }req 
     * @param res 
     */
    async updateImage(req: Request, res: Response, next: NextFunction) {

        // Fetch the details from currently loggedIn user
        const userId = req['userId'];

        // Fetch the fileName from fileHandler middleware
        const fileName = req['fileName'];

        try {

            // Find the user and update their respective profileImage
            const user = await User.findByIdAndUpdate({
                _id: userId
            }, {
                profile_pic: fileName
            }, {
                new: true
            }).select('first_name last_name profile_pic role integrations');

            // Send status 200 response
            return res.status(200).json({
                message: 'User profile picture updated!',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    // -| TOKENS |-
    /**
     * This function is responsible for updating the google token for the particular user
     * @param { userId, token }req 
     * @param res 
     */
    async addGdriveToken(req: Request, res: Response, next: NextFunction) {
        try{
            const {
                body: { token }
              } = req;
            const userId = req['userId'];
            // const token = req['token'];

            const user = await User.findByIdAndUpdate(
                {
                    _id: userId
                }, {
                    'integrations.gdrive.token': token
                }, {
                    new: true
                });
        
            return res.status(200).json({
                message: 'Saved gdrive token.',
                user
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    /**
     * This function is responsible for retrieving the google token for the particular user
     * @param { userId }req 
     * @param res 
     */
    async getGdriveToken(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            const user: any = await User.findOne({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            }).select('integrations');

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                gDriveToken: user.integrations.gdrive.token
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

  /**
   * This function is responsible for retreiving the user´s most frequent groups
   * @param { userId }req 
   * @param res 
   */
  async getRecentGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const { params: { userId } } = req;

      if (!userId) {
        return res.status(400).json({
          message: 'Please provide the userId!'
        })
      }

      const user = await User.findOne({_id: userId})
        .select("_id stats")
        .populate({
            path: 'stats.groups._group'
        })
        .lean();

      if (user['stats'] && user['stats']['groups']) {
        user['stats']['groups'].sort(function(a, b) {
          return b.count - a.count;
        });

        user['stats']['groups'] = user['stats']['groups'].slice(0, 3);
      }

      // Send the status 200 response
      return res.status(200).json({
        message: `User found!`,
        user: user
      });
    } catch (err) {
      return sendError(res, err, 'Internal Server Error!', 500);
    }
  }

  /**
  * This function is responsible for changing the role of the other user
  * @param req 
  * @param res 
  * @param next 
  */
  async incrementGroupVisit(req: Request, res: Response, next: NextFunction) {

    const { userId, groupId } = req.body;

    try {

      let user: any = await User.findOne({
        $and: [
            { _id: userId },
            { active: true },
            {'stats.groups._group': groupId }
        ]
      }).select('_id');

      // Find the user and update their respective role
      if (!user) {
        user = await User.findOneAndUpdate({
            _id: userId,
            'stats.groups._group': {$ne: groupId }
            }, { $push: { 'stats.groups': { _group: groupId, count: 1 }}}
            )
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });
      } else {
        user = await User.findOneAndUpdate({
            _id: userId,
            'stats.groups._group': groupId 
            }, { $inc: { 'stats.groups.$.count': 1 }
            })
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });
      }
      // Send status 200 response
      return res.status(200).json({
          message: `User Stats has been updated`,
          user: user
      });

    } catch (err) {
        return sendError(res, err, 'Internal Server Error!', 500);
    }
  }

  /**
   * This function is responsible for retreiving the user´s favorite groups
   * @param { userId }req 
   * @param res 
   */
  async getFavoriteGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const { params: { userId } } = req;

      if (!userId) {
        return res.status(400).json({
          message: 'Please provide the userId!'
        })
      }

      const user = await User.findOne({_id: userId})
        .select("_id stats integrations")
        .populate({
            path: 'stats.favorite_groups',
            select: '_id group_name group_avatar'
        })
        .lean();

      if (user['stats'] && user['stats']['favorite_groups']) {
        user['stats']['favorite_groups'].sort(function(a, b) {
          return b.group_name - a.group_name;
        });
      }

      // Send the status 200 response
      return res.status(200).json({
        message: `User found!`,
        user: user
      });
    } catch (err) {
      return sendError(res, err, 'Internal Server Error!', 500);
    }
  }

  /**
  * This function is responsible for adding/removing a group from user´s favorites
  * @param req 
  * @param res 
  * @param next 
  */
  async addFavoriteGroup(req: Request, res: Response, next: NextFunction) {

    const { userId, groupId, isFavoriteGroup } = req.body;

    try {

        let update = {};
        if (isFavoriteGroup) {
            update = { $push: { 'stats.favorite_groups': groupId}};
        } else {
            update = { $pull: { 'stats.favorite_groups': groupId}};
        }

        // Find the user and update their respective role
        let user = await User.findOneAndUpdate({
                _id: userId
            }, update)
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });

        if (user['stats'] && user['stats']['favorite_groups']) {
            user['stats']['favorite_groups'].sort(function(a, b) {
                return b.group_name - a.group_name;
            });
        }

        // Send status 200 response
        return res.status(200).json({
            message: `User Stats has been updated`,
            user: user
        });

    } catch (err) {
        return sendError(res, err, 'Internal Server Error!', 500);
    }
  }

  async removeUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return sendError(res, new Error('Please provide the userId property!'), 'Please provide the userId property!', 500);
        }

        // Find if the user is owner of a workspace, in this case we will not delete him unless we remove the workspace
        const workspace = await Workspace.findOne({ _owner: userId });

        if (workspace) {
            return sendError(res, new Error('Could not delete the user. User is owner of a workspace!'), 'Could not delete the user. User is owner of a workspace!', 404);
        }

        // remove user
        const user = await User.findByIdAndDelete(userId).select('_account _workspace integrations');
        const workspaceId = user._workspace;

        const usersCount: number = await User.find({ $and: [
            { active: true },
            { _workspace: workspaceId }
        ] }).countDocuments();

        // Remove user from groups
        await Group.updateMany({
                _members: userId
            }, {
                $pull: {
                    _members: userId
                }
            });
        await Group.updateMany({
                _admins: userId
            }, {
                $pull: {
                    _admins: userId
                }
            });

        // Remove user from workspaces
        const workspaceUpdated = await Workspace.findByIdAndUpdate(
                workspaceId
            , {
                $pull: {
                    _members: userId
                }
            });

        const accountId = user?._account?._id || user?._account;
        if (accountId) {
            // Count the number of workspces for the account
            let accountUpdate = await Account.findById(accountId);
            const numWorkspaces = accountUpdate._workspaces.length;

            if (numWorkspaces < 2) {
                // If account only has one workspace, the account is removed
                accountUpdate = await Account.findByIdAndDelete(accountId);
            } else {
                // If account has more than one workspaces, the workspace is removed from the account
                accountUpdate = await Account.findByIdAndUpdate({
                        _id: accountId
                    }, {
                        $pull: {
                            _workspaces: workspaceId
                        }
                    });
            }
        }

        // Send new workspace to the mgmt portal
        // Count all the groups present inside the workspace
        const groupsCount: number = await Group.find({ $and: [
            { group_name: { $ne: 'personal' } },
            { _workspace: workspaceId }
        ]}).countDocuments();

        // Count all the users present inside the workspace
        const guestsCount: number = await User.find({ $and: [
            { active: true },
            { _workspace: workspaceId },
            { role: 'guest'}
        ] }).countDocuments();

        let workspaceMgmt = {
            _id: workspaceId,
            company_name: workspaceUpdated.company_name,
            workspace_name: workspaceUpdated.workspace_name,
            owner_email: workspaceUpdated.owner_email,
            owner_first_name: workspaceUpdated.owner_first_name,
            owner_last_name: workspaceUpdated.owner_last_name,
            _owner_remote_id: workspaceUpdated._owner,
            environment: process.env.DOMAIN,
            num_members: usersCount,
            num_invited_users: guestsCount,
            num_groups: groupsCount,
            created_date: workspaceUpdated.created_date,
            access_code: workspace.access_code,
            management_private_api_key: workspace.management_private_api_key
        }

        http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspaceId}/update`, {
            API_KEY: workspace.management_private_api_key,
            workspaceData: workspaceMgmt
        });

        http.delete(`${process.env.MANAGEMENT_URL}/api/user/${userId}`, {
            data: {
                API_KEY: workspace.management_private_api_key,
                workspaceId: workspace._id,
            }
        });

        // Send the status 200 response 
        return res.status(200).json({
            message: 'User deleted.'
        });
    } catch (err) {
        return sendError(res, err, 'Internal Server Error!', 500);
    }
  }

  async saveIconSidebarByDefault(req: Request, res: Response, next: NextFunction) {

    const { iconsSidebar, userId } = req.body;
    try {

        let user: any = await User.findOneAndUpdate({
            _id: userId
            }, { $set: { 'stats.default_icons_sidebar': iconsSidebar }})
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            });

        if (user['stats'] && user['stats']['favorite_groups']) {
            user['stats']['favorite_groups'].sort(function(a, b) {
              return b.group_name - a.group_name;
            });
        }

      // Send status 200 response
      return res.status(200).json({
          message: `User Stats has been updated`,
          user: user
      });

    } catch (err) {
        return sendError(res, err, 'Internal Server Error!', 500);
    }
  }

  async getOutOfOfficeDays(req: Request, res: Response, next: NextFunction) {

    const userId = req['userId'];
    try {

      let user: any = await User.findOne({
          _id: userId
        })
        .select('_id out_of_office integrations');

      // Send status 200 response
      return res.status(200).json({
          message: `User out of the office days`,
          user: user
      });

    } catch (err) {
        return sendError(res, err, 'Internal Server Error!', 500);
    }
  }

  async saveOutOfOfficeDays(req: Request, res: Response, next: NextFunction) {

    const { days, action } = req.body;
    const userId = req['userId'];
    
    try {


        let user: any = await User.findOne({
          _id: userId
        });

        if (action == 'add') {
            days.forEach(day => {
                const index = user.out_of_office.findIndex(outOfficeDay => moment(outOfficeDay.date,"YYYY-MM-DD").isSame(moment(day.date).format("YYYY-MM-DD"), 'day'));
                if (index < 0) {
                    day.date = moment(day.date).format('YYYY-MM-DD');
                    user.out_of_office.push(day);
                }
            });
        } else if (action == 'remove') {
            days.forEach(day => {
                const index = user.out_of_office.findIndex(outOfficeDay => moment(moment.utc(outOfficeDay.date).format('YYYY-MM-DD')).isSame(moment(moment(day.date).format('YYYY-MM-DD')), 'day'));
                if (index >= 0) {
                    user.out_of_office.splice(index, 1);
                }
            });
        }
        

        user.save();
        
        // Send status 200 response
        return res.status(200).json({
            message: `User Stats has been updated`,
            user: user
        });

    } catch (err) {
        return sendError(res, err, 'Internal Server Error!', 500);
    }
  }
}