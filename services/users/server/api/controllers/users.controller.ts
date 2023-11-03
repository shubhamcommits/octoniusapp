import { Account, Group, Holiday, User, Workspace } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError,PasswordHelper, axios } from '../../utils';
import { DateTime } from 'luxon';
import http from 'axios';
import { HolidayService } from '../services';
import { Readable } from 'stream';

/*  ===================
 *  -- USER METHODS --
 *  ===================
 * */
const passwordHelper = new PasswordHelper();
const holidayService = new HolidayService()

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
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: 'stats.favorite_portfolios',
                select: '_id portfolio_name portfolio_avatar'
            })
            .populate({
                path: 'stats.favorite_collections',
                select: '_id name collection_avatar'
            })
            .populate({
                path: '_groups',
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
                })
                .populate({
                    path: '_account._workspaces',
                    select: '_id workspace_name workspace_avatar'
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
     * This function is responsible for fetching the account details of the  user
     * @param { userId } req.params
     * @param res
     * @param next
     */
    async getOtherAccount(req: Request, res: Response, next: NextFunction) {

        const { params: { userId } } = req;

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
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
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
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
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
    
            if (body.email) {
                user._account.email = body.email;
            }

            // Send user to the mgmt portal
            const workspace: any = await Workspace.find({
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

            axios.put(`${process.env.MANAGEMENT_URL}/api/user/${userMgmt._id}/update`, {
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
     * 
     * @param req 
     * @param res 
     * @param next 
     */
    

    async editProperty(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { userId }, body: { propertyToSave } } = req;

            if (!userId || !propertyToSave) {
                return sendError(res, new Error('Please provide the userId and propertyToSave properties!'), 'Please provide the userId and propertyToSave properties!', 500);
            }

            const user = await User.findByIdAndUpdate({
                    _id: userId
                }, {
                    $set: propertyToSave
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                })
                .lean();
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'User edited.',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

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

                const workspace: any = await Workspace.find({
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

                axios.put(`${process.env.MANAGEMENT_URL}/api/user/${userMgmt._id}/update`, {
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
     * This function is responsible for fetching the account details of the  user
     * @param { userId } req.params
     * @param res
     * @param next
     */
    async getAccountWorkspaces(req: Request, res: Response, next: NextFunction) {

        const { params: { userId } } = req;

        try {

            // Find the user based on the userId
            const user = await User.findOne({ _id: userId }).lean();

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            const account = await Account.findOne({_id: user._account})
                .populate('_workspaces', '_id workspace_name workspace_avatar').lean();

            // If user not found
            if (!account) {
                return sendError(res, new Error('Unable to find the account, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Workspaces found!',
                workspaces: account._workspaces
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
            const guestsCount: number = await User.find({
                $and: [
                    { active: true },
                    { _workspace: workspaceId },
                    { role: 'guest'}
                ]}).countDocuments();

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

            axios.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
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
            }).select('first_name last_name profile_pic role _workspace _account integrations hr_role');

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
                    return sendError(res, new Error(`Unable to update the group, some unexpected error occurred!`), `Unable to update the group, some unexpected error occurred!`, 500);
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
                return sendError(res, new Error('Unable to update the user, some unexpected error occurred!'), 'Unable to update the user, some unexpected error occurred!', 500);
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
     * This function is responsible for updating the HR role of the user
     * @param { memberId }req 
     * @param res 
     */
    async changeHRRole(req: Request, res: Response, next: NextFunction) {

        const { memberId, hr_role } = req.body;
        try {

            // find the user
            let user: any = await User.findOneAndUpdate({
                    $and: [
                        { _id: memberId },
                        { active: true }
                    ]
                }, 
                { 
                    $set: { hr_role: hr_role }
                }, {
                    new: true
                }).select('first_name last_name profile_pic role _workspace _account integrations hr_role');

            // Error updating the user
            if (!user) {
                return sendError(res, new Error('Unable to update the user, some unexpected error occurred!'), 'Unable to update the user, some unexpected error occurred!', 500);
            }

            // Send status 200 response
            return res.status(200).json({
                message: `Role updated for user ${user.first_name}`,
                user: user
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

            let user = await User.findById(
                {
                    _id: userId
                }).select('integrations').lean();
            if (user.integrations.gdrive) {
                user = await User.findByIdAndUpdate(
                    {
                        _id: userId
                    }, {
                        'integrations.gdrive.token': token
                    }, {
                        new: true
                    });
            } else {
                const gdrive = {
                    token: token
                }
                user = await User.findByIdAndUpdate(
                    {
                        _id: userId
                    }, {
                        'integrations.gdrive': gdrive
                    }, {
                        new: true
                    });
            }
            
        
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
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
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
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
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
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: 'stats.favorite_portfolios',
                select: '_id portfolio_name portfolio_avatar'
            })
            .populate({
                path: 'stats.favorite_collections',
                select: '_id name collection_avatar'
            })
            .populate({
                path: '_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            })
            .lean();

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
     * This function is responsible for retreiving the user´s favorite portfolios
     * @param { userId }req 
     * @param res 
     */
    async getFavoritePortfolios(req: Request, res: Response, next: NextFunction) {
        try {
        const { params: { userId } } = req;

        if (!userId) {
            return res.status(400).json({
            message: 'Please provide the userId!'
            })
        }

        const user = await User.findOne({_id: userId})
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: 'stats.favorite_portfolios',
                select: '_id portfolio_name portfolio_avatar'
            })
            .populate({
                path: 'stats.favorite_collections',
                select: '_id name collection_avatar'
            })
            .populate({
                path: '_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            })
            .lean();

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
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

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
     * This function is responsible for adding/removing a portfolio from user´s favorites
     * @param req 
     * @param res 
     * @param next 
     */
    async addFavoritePortfolio(req: Request, res: Response, next: NextFunction) {

        const { userId, portfolioId, isFavoritePortfolio } = req.body;

        try {

            let update = {};
            if (isFavoritePortfolio) {
                update = { $push: { 'stats.favorite_portfolios': portfolioId}};
            } else {
                update = { $pull: { 'stats.favorite_portfolios': portfolioId}};
            }

            // Find the user and update their respective role
            let user = await User.findOneAndUpdate({
                    _id: userId
                }, update)
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

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
     * This function is responsible for adding/removing a collection from user´s favorites
     * @param req 
     * @param res 
     * @param next 
     */
    async addFavoriteCollection(req: Request, res: Response, next: NextFunction) {

        const { collectionId, isFavoriteCollection } = req.body;
        const userId = req['userId'];

        try {
            let update = {};
            if (isFavoriteCollection) {
                update = { $addToSet: { 'stats.favorite_collections': collectionId}};
            } else {
                update = { $pull: { 'stats.favorite_collections': collectionId}};
            }

            // Find the user and update their respective role
            let user = await User.findOneAndUpdate({
                    _id: userId
                }, update, { new: true })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

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

            // In case the user is the only member, delete the group
            let groupsStream = Readable.from(
                await Group.find({
                    $and: [
                        { type: { $ne: 'agora' } },
                        {
                            $or: [
                                { _admins: userId },
                                { _members: userId }
                            ]
                        }
                    ]
                }).lean()
            );
            await groupsStream.on('data', async (group: any) => {
                if ((group._members.length == 0 && group._admins.length == 1) || (group._members.length == 1 && group._admins.length == 0)) {
                    http.delete(`${process.env.GROUPS_SERVER_API}/${group._id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': req.headers.authorization
                        }
                    });
                }
            });

            // const userGroups = await Group.find({
            //         $and: [
            //             { type: { $ne: 'agora' } },
            //             {
            //                 $or: [
            //                     { _admins: userId },
            //                     { _members: userId }
            //                 ]
            //             }
            //         ]
            //     }).select('_members _admins').lean();

            // userGroups.forEach(group => {
            //     if ((group._members.length == 0 && group._admins.length == 1) || (group._members.length == 1 && group._admins.length == 0)) {
            //         http.delete(`${process.env.GROUPS_SERVER_API}/${group._id}`, {
            //             headers: {
            //                 'Content-Type': 'application/json',
            //                 'Authorization': req.headers.authorization
            //             }
            //         });
            //     }
            // });

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

            // const usersCount: number = await User.find({ $and: [
            //     { active: true },
            //     { _workspace: workspaceId }
            // ] }).countDocuments();

            // // Send new workspace to the mgmt portal
            // // Count all the groups present inside the workspace
            // const groupsCount: number = await Group.find({ $and: [
            //     { group_name: { $ne: 'personal' } },
            //     { _workspace: workspaceId }
            // ]}).countDocuments();

            // // Count all the users present inside the workspace
            // const guestsCount: number = await User.find({ $and: [
            //     { active: true },
            //     { _workspace: workspaceId },
            //     { role: 'guest'}
            // ] }).countDocuments();

            // let workspaceMgmt = {
            //     _id: workspaceId,
            //     company_name: workspaceUpdated.company_name,
            //     workspace_name: workspaceUpdated.workspace_name,
            //     owner_email: workspaceUpdated.owner_email,
            //     owner_first_name: workspaceUpdated.owner_first_name,
            //     owner_last_name: workspaceUpdated.owner_last_name,
            //     _owner_remote_id: workspaceUpdated._owner,
            //     environment: process.env.DOMAIN,
            //     num_members: usersCount,
            //     num_invited_users: guestsCount,
            //     num_groups: groupsCount,
            //     created_date: workspaceUpdated.created_date,
            //     access_code: workspaceUpdated.access_code,
            //     management_private_api_key: workspaceUpdated.management_private_api_key
            // }

            // axios.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspaceId}/update`, {
            //     API_KEY: workspaceUpdated.management_private_api_key,
            //     workspaceData: workspaceMgmt
            // });

            axios.delete(`${process.env.MANAGEMENT_URL}/api/user/${userId}`, {
                data: {
                    API_KEY: workspaceUpdated.management_private_api_key,
                    // workspaceData: workspaceMgmt
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
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                });

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
        try {
            const { from, to } = req.query;
            const { userId } = req.params;
            
            const holidaysInMonth = await Holiday.find({
                    $and: [
                        { _user: userId },
                        {
                            $or: [
                                { start_date: { $gte: from }},
                                { end_date: { $lte: to} }
                            ]
                        }
                    ]
                })
                .populate({
                    path: '_user',
                    select: '_id email first_name last_name profile_pic'
                })
                .populate({
                    path: '_approval_manager',
                    select: '_id email first_name last_name profile_pic'
                })
                .lean() || [];


            const firstDayOfYear = new DateTime(from).startOf('year').toISO();
            const lastDayOfYear = new DateTime(from).endOf('year').toISO();

            const holidaysInYear = await Holiday.find({
                    $and: [
                        { _user: userId },
                        { end_date: { $gte: firstDayOfYear }},
                        { start_date: { $lte: lastDayOfYear} }
                    ]
                })
                .populate({
                    path: '_user',
                    select: '_id email first_name last_name profile_pic'
                })
                .populate({
                    path: '_approval_manager',
                    select: '_id email first_name last_name profile_pic'
                })
                .lean() || [];

            const pastHolidays = await Holiday.find({
                    $and: [
                        { _user: userId },
                        // { end_date: { $gte: firstDayOfYear }},
                        { start_date: { $lte: firstDayOfYear} }
                    ]
                })
                .populate({
                    path: '_user',
                    select: '_id email first_name last_name profile_pic'
                })
                .populate({
                    path: '_approval_manager',
                    select: '_id email first_name last_name profile_pic'
                })
                .lean() || [];

            // Send status 200 response
            return res.status(200).json({
                message: `User out of the office days`,
                holidaysInMonth: holidaysInMonth,
                holidaysInYear: holidaysInYear,
                pastHolidays: pastHolidays
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * Save the widgets selected for the global dashboard.
     */
    async saveSelectedWidgets(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.params;
        const { selectedWidgets } = req.body;

        try {
            const user = await User.findByIdAndUpdate(userId, {
                $set: { 'selected_widgets': selectedWidgets }
            }).select('selected_widgets').lean();

            return res.status(200).json({
                message: 'User updated!',
                user: user
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    async saveCustomField(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { userId } = req.params;

        // Fetch the newCustomField from fileHandler middleware
        const customFieldValue = req.body['customFieldValue'];
        const customFieldName = req.body['customFieldName'];

        let user = await User.findById(userId);

        if (!user['profile_custom_fields']) {
            user['profile_custom_fields'] = new Map<string, string>();
        }
        user['profile_custom_fields'].set(customFieldName, customFieldValue);

        // Find the post and update the custom field
        user = await User.findByIdAndUpdate({
                _id: userId
            }, {
                $set: { "profile_custom_fields": user['profile_custom_fields'] }
            }, {
                new: true
            });

        // user.custom_fields[customFieldName] = customFieldValue;

        // Send status 200 response
        return res.status(200).json({
            message: 'Custom Field updated!',
            user: user
        });
    }

    async saveCustomFieldsFrom3rdPartySync(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { userId } = req.params;

        // Fetch the customFieldsMap & workspaceId from fileHandler middleware
        const customFieldsMap = req.body['customFieldsMap'];
        const workspaceId = req.body['workspaceId'];

        try {
            let user = await User.findByIdAndUpdate({
                    _id: userId
                }, {
                    $set: { "profile_custom_fields": customFieldsMap }
                }, {
                    new: true
                }).lean();

            const workspace = await Workspace.findById(workspaceId).select('profile_custom_fields').lean();

            const userCFNames = Object.keys(customFieldsMap);

            for (let i = 0; i < userCFNames.length; i++) {
                const property = userCFNames[i];

                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                const index = workspace.profile_custom_fields ? workspace.profile_custom_fields.findIndex(userProperty => userProperty.name == property) : -1;
                if ( index >= 0 && workspace.profile_custom_fields[index] && workspace.profile_custom_fields[index].user_type
                        && re.test(String(customFieldsMap[property]).toLowerCase())) {

                    const userOctonius = await User.findOne({
                        $and: [
                            { _workspace: workspaceId },
                            { email: customFieldsMap[property] }
                        ]}).select('_id').lean();

                    if (userOctonius) {

                        if (!user['profile_custom_fields']) {
                            user['profile_custom_fields'] = new Map<string, string>();
                        }
                        user['profile_custom_fields'][property] = userOctonius._id;

                        user = await User.findByIdAndUpdate({
                                _id: userId
                            }, {
                                $set: { "profile_custom_fields": user['profile_custom_fields'] }
                            }, {
                                new: true
                            }).lean();
                    }
                }
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Custom Field updated!',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);           
        }
    }

    async saveLocale(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const localeCode = req.body['localeCode'];
        const userId = req['userId'];

        try {
            let user = await User.findByIdAndUpdate({
                    _id: userId
                }, {
                    $set: { "stats.locale": localeCode }
                }, {
                    new: true
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Locale updated!',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);           
        }
    }

    async savePayrollCustomField(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { userId } = req.params;

        // Fetch the newCustomField from fileHandler middleware
        const customFieldValue = req.body['customFieldValue'];
        const customFieldId = req.body['customFieldId'];

        let user: any = await User.findById(userId);

        if (!user.hr) {
            user.hr = {};
        }

        if (!user.hr.entity_custom_fields) {
            user.hr.entity_custom_fields = new Map<string, string>();
        }
        user.hr.entity_custom_fields.set(customFieldId, customFieldValue);

        // Find the post and update the custom field
        user = await User.findByIdAndUpdate({
                _id: userId
            }, {
                $set: { "hr.entity_custom_fields": user.hr.entity_custom_fields }
            }, {
                new: true
            })
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: 'stats.favorite_portfolios',
                select: '_id portfolio_name portfolio_avatar'
            })
            .populate({
                path: 'stats.favorite_collections',
                select: '_id name collection_avatar'
            })
            .populate({
                path: '_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            })
            .lean();

        // user.custom_fields[customFieldId] = customFieldValue;

        // Send status 200 response
        return res.status(200).json({
            message: 'Payroll Custom Field updated!',
            user: user
        });
    }

    async savePayrollVariable(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { userId } = req.params;

        const variableValue = req.body['variableValue'];
        const variableId = req.body['variableId'];

        let user = await User.findById(userId);

        if (!user.hr) {
            user.hr = {};
        }
        
        if (!user.hr.entity_variables) {
            user.hr.entity_variables = new Map<string, string>();
        }
        user.hr.entity_variables.set(variableId, variableValue);

        // Find the post and update the custom field
        user = await User.findByIdAndUpdate({
                _id: userId
            }, {
                $set: { "hr.entity_variables": user.hr.entity_variables }
            }, {
                new: true
            })
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: 'stats.favorite_portfolios',
                select: '_id portfolio_name portfolio_avatar'
            })
            .populate({
                path: 'stats.favorite_collections',
                select: '_id name collection_avatar'
            })
            .populate({
                path: '_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            })
            .lean();

        // Send status 200 response
        return res.status(200).json({
            message: 'Payroll Variable updated!',
            user: user
        });
    }

    async savePayrollBenefit(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { userId } = req.params;

        const benefitValue = req.body['benefitValue'];
        const benefitId = req.body['benefitId'];

        let user = await User.findById(userId);

        if (!user.hr) {
            user.hr = {};
        }
        
        if (!user.hr.entity_benefits) {
            user.hr.entity_benefits = new Map<string, string>();
        }
        user.hr.entity_benefits.set(benefitId, benefitValue);

        // Find the post and update the custom field
        user = await User.findByIdAndUpdate({
                _id: userId
            }, {
                $set: { "hr.entity_benefits": user.hr.entity_benefits }
            }, {
                new: true
            })
            .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
            .populate({
                path: 'stats.favorite_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: 'stats.favorite_portfolios',
                select: '_id portfolio_name portfolio_avatar'
            })
            .populate({
                path: 'stats.favorite_collections',
                select: '_id name collection_avatar'
            })
            .populate({
                path: '_groups',
                select: '_id group_name group_avatar'
            })
            .populate({
                path: '_account',
                select: '_id email _workspaces first_name last_name created_date'
            })
            .lean();

        // Send status 200 response
        return res.status(200).json({
            message: 'Payroll Benefits updated!',
            user: user
        });
    }

    async savePayrollExtraDaysOff(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { userId }, body: { propertyToSave } } = req;

            if (!userId || !propertyToSave) {
                return sendError(res, new Error('Please provide the userId property!'), 'Please provide the entityId property!', 500);
            }

            const user = await User.findByIdAndUpdate({
                    _id: userId
                }, {
                    $set: propertyToSave
                })
                .select('_id active email first_name last_name profile_pic workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats integrations profile_custom_fields hr hr_role')
                .populate({
                    path: 'stats.favorite_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: 'stats.favorite_portfolios',
                    select: '_id portfolio_name portfolio_avatar'
                })
                .populate({
                    path: 'stats.favorite_collections',
                    select: '_id name collection_avatar'
                })
                .populate({
                    path: '_groups',
                    select: '_id group_name group_avatar'
                })
                .populate({
                    path: '_account',
                    select: '_id email _workspaces first_name last_name created_date'
                })
                .lean();
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'Member edited.',
                user: user
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async createHoliday(req: Request, res: Response, next: NextFunction) {

        const { holiday } = req.body;
        const { userId } = req.params;

        try {
            delete holiday._id;
            holiday._user = userId;
            const calculatedDays = await holidayService.calculateNumDays(userId, holiday.start_date, holiday.end_date, holiday.type);

            if (!!calculatedDays.code) {
                return sendError(res, new Error(calculatedDays.code), calculatedDays.code, 500);
            }

            holiday.num_days = calculatedDays.totalDays;

            const newHoliday = await Holiday.create(holiday);
            
            // Send status 200 response
            return res.status(200).json({
                message: `Holiday has been created`,
                holiday: newHoliday
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async editHoliday(req: Request, res: Response, next: NextFunction) {

        const { holiday } = req.body;
        const { userId } = req.params;

        try {
            const calculatedDays = await holidayService.calculateNumDays(userId, holiday.start_date, holiday.end_date, holiday.type);
            
            if (!!calculatedDays.code) {
                return sendError(res, new Error(calculatedDays.code), calculatedDays.code, 500);
            }

            holiday.num_days = calculatedDays.totalDays;

            const holidayEdited = await Holiday.findByIdAndUpdate({
                    _id: holiday._id
                }, {
                    $set: { holiday }
                })
                .populate({
                    path: '_user',
                    select: '_id email first_name last_name profile_pic'
                })
                .populate({
                    path: '_approval_manager',
                    select: '_id email first_name last_name profile_pic'
                })
                .lean();
            
            // Send status 200 response
            return res.status(200).json({
                message: `Holiday has been edited`,
                holiday: holidayEdited
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async editHolidaStatus(req: Request, res: Response, next: NextFunction) {

        const { status, rejection_description } = req.body;
        const { holidayId } = req.params;

        try {
            const holidayEdited = await Holiday.findByIdAndUpdate({
                    _id: holidayId
                }, {
                    $set: {
                        status: status,
                        rejection_description: rejection_description
                    }
                })
                .populate({
                    path: '_user',
                    select: '_id email first_name last_name profile_pic'
                })
                .populate({
                    path: '_approval_manager',
                    select: '_id email first_name last_name profile_pic'
                })
                .lean();
            
            // Send status 200 response
            return res.status(200).json({
                message: `Holiday has been edited`,
                holiday: holidayEdited
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async deleteHoliday(req: Request, res: Response, next: NextFunction) {

        const { holidayId } = req.params;

        try {
            await Holiday.findByIdAndDelete({
                    _id: holidayId
                });
            
            // Send status 200 response
            return res.status(200).json({
                message: `Holiday has been deleted`,
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getNumHolidays(req: Request, res: Response, next: NextFunction) {

        const { from, to, type } = req.query;
        const { userId } = req.params;

        try {
            const num_days = await holidayService.calculateNumDays(userId, from, to, type.toString());

            // Send status 200 response
            return res.status(200).json({
                message: `Number of holidays have been calculated`,
                numDays: num_days.totalDays,
                code: num_days.code
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getPendingApprovalHolidays(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            
            const holidays = await Holiday.find({
                    $and: [
                        { _approval_manager: userId },
                        { status: 'pending' }
                    ]
                })
                .populate({
                    path: '_user',
                    select: '_id email first_name last_name profile_pic'
                })
                .populate({
                    path: '_approval_manager',
                    select: '_id email first_name last_name profile_pic'
                })
                .lean() || [];

            // Send status 200 response
            return res.status(200).json({
                message: `User pending holidays to approve.`,
                holidays: holidays
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}