import { User } from '../models';
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
                .select('_id active first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group');

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
            }).select('_id active first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group');

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Index
            http.post(`${process.env.QUERY_SERVER_API}/indexing/user`, {
                id: user._id,
                fullName: user.full_name,
                email: user.email,
                active: user.active,
                userSkills: user.skills
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

}