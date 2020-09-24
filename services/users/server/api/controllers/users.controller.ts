import { Group, User } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';
import http from 'axios';

/*  ===================
 *  -- USER METHODS --
 *  ===================
 * */
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
                .select('_id active first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats');

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
                .select('_id active first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group');

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

            // Find the user and update it on the basis of the userId
            const user: any = await User.findByIdAndUpdate({
                _id: userId
            }, {
                $set: body
            }, {
                new: true
            }).select('_id active first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group stats');

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

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
     * This function is responsible for changing the role of the other user
     * @param req 
     * @param res 
     * @param next 
     */
    async updateUserRole(req: Request, res: Response, next: NextFunction) {

        const { userId, role } = req.body;
        try {

            // Find the user and update their respective role
            const user: any = await User.findOneAndUpdate({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            }, {
                role: role
            }, {
                new: true
            }).select('first_name last_name profile_pic email role');
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
            }).select('first_name last_name profile_pic email role');

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
            path: 'stats.groups._group'//,
            /*
            options: {
                sort: { 'stats.groups.count': -1 }
            }
            */
        })
        .sort({ 'stats.groups.count': -1 })
        .slice('stats.groups', 3)
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
        }, { $push: { 'stats.groups': { _group: groupId, count: 1 }}});
      } else {
        user = await User.findOneAndUpdate({
          _id: userId,
          'stats.groups._group': groupId 
        }, { $inc: { 'stats.groups.$.count': 1 }
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
}