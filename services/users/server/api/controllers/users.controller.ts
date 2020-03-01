import { User } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';

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

}