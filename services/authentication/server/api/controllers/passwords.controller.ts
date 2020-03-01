import { Request, Response } from 'express';
import { User, Workspace, Resetpwd } from '../models';
import { sendError, PasswordHelper } from '../../utils';
import http from 'axios';

// Password Helper Class
const passwordHelper = new PasswordHelper();

export class PasswordsControllers {

    /**
     * This function changes the password
     * @param { body.resetPwdId, body.password }req 
     * @param res 
     */
    async resetPassword(req: Request, res: Response) {
        try {
            // grab the resetPWD + document user + delete the resetPwd document
            const delResetPwdDoc: any = await User.findOneAndDelete({ _id: req.body.resetPwdId })
                .populate('user', 'password');

            if (!delResetPwdDoc) {
                return sendError(res, new Error('Your link is not valid'), 'Your link is not valid', 401);
            }

            // the user that requested the password reset
            let user = delResetPwdDoc.user;

            // delete all the other reset pasword documents of this user
            await Resetpwd.remove({ user: user._id });

            // Encrypting user password
            const passEncrypted: any = await passwordHelper.encryptPassword(req.body.password);

            // Error creating the password
            if (!passEncrypted) {
                return sendError(res, new Error('An error occurred trying to create the password, please choose another password!'), 'An error occurred trying to create the password, please choose another password!', 401);
            }

            //  save the encrypted password in the user document
            user.password = passEncrypted.password;

            // Save the new user document
            await user.save();

            res.status(200).json({
                message: 'succesfully changed password'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function retrieves the reset password information
     * @param { params.userId }req 
     * @param res 
     */
    async resetPasswordDetails(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            // find the document that is linked to this password reset
            const resetPwdDoc = await Resetpwd.findOne({ _id: userId })
                .populate('user', 'first_name last_name profile_pic');

            // if we don't find a document we throw an error
            if (!resetPwdDoc) {
                return sendError(res, new Error('This link is no longer valid'), 'This link is no longer valid', 401);
            }

            // Send the status 200 response 
            res.status(200).json({
                message: 'Succesfully retrieved reset password information',
                resetPwdDoc
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function sends the reset password email
     * @param { body.workspace_name, body.email }req 
     * @param res 
     */
    async sendResetPasswordMail(req: Request, res: Response) {
        try {

            let { workspace_name, email } = req.body;

            // Retrieve the workspace
            const workspace = await Workspace.findOne({ workspace_name: workspace_name })
                .select('workspace_name')

            // error finding the workspace
            if (!workspace) {
                return sendError(res, new Error('We were unable to find this workspace! Please try again.'), 'We were unable to find this workspace! Please try again.', 401);
            }

            // Search for the desired user
            const user = await User.findOne({
                $and: [
                    { _workspace: workspace._id },
                    { email: email }
                ]
            })
                .select('first_name last_name email')

            // Error finding the user
            if (!user) {
                return sendError(res, new Error('We were unable to find a user with this email / workspace combination! Please try again.'), 'We were unable to find a user with this email / workspace combination! Please try again.', 401);
            }

            // Send email to user using mailing microservice
            await http.post('http://localhost:2000/api/mails/reset-password', {
                user: user,
                workspace: workspace
            })

            // Send the status 200 response 
            res.status(200).json({
                message: 'successfully sent email'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };
}
