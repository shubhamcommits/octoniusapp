import { Request, Response } from 'express';
import { User, Workspace, Resetpwd, Account } from '../models';
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
            const delResetPwdDoc: any = await Resetpwd.findOneAndDelete({ _id: req.body.resetPwdId })
                .populate('_account');

            if (!delResetPwdDoc) {
                return sendError(res, new Error('Your link is not valid'), 'Your link is not valid', 401);
            }

            // the user that requested the password reset
            let account = delResetPwdDoc._account;

            // delete all the other reset pasword documents of this user
            await Resetpwd.remove({ _account: account._id });

            // Encrypting user password
            const passEncrypted: any = await passwordHelper.encryptPassword(req.body.password);

            // Error creating the password
            if (!passEncrypted) {
                return sendError(res, new Error('An error occurred trying to create the password, please choose another password!'), 'An error occurred trying to create the password, please choose another password!', 401);
            }

            //  save the encrypted password in the user document
            account.password = passEncrypted.password;

            // Save the new user document
            await account.save();

            res.status(200).json({
                message: 'succesfully changed password'
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
            const account = await Account.findOne({
                $and: [
                    { email: email }
                ]
            }).select('_id email');

            // Error finding the user
            if (!account) {
                return sendError(res, new Error('We were unable to find an account with this email combination! Please try again.'), 'We were unable to find an account with this email combination! Please try again.', 401);
            }

            const user = await User.findOne({
                $and: [
                    { _workspace: workspace._id },
                    { _account: account._id }
                ]
            }).select('first_name last_name');

            // Error finding the user
            if (!user) {
                return sendError(res, new Error('We were unable to find a user with this email for the workspace combination! Please try again.'), 'We were unable to find a user with this email for the workspace combination! Please try again.', 401);
            }

            const userEmail = {
                _id: account._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: account.email
            }

            // Send email to user using mailing microservice
            http.post(`${process.env.MAILING_SERVER_API}/reset-password`, {
                user: userEmail,
                workspace: workspace
            })
            .catch((err)=>{
                console.log(err)
            })

            // Send the status 200 response 
            return res.status(200).json({
                message: 'successfully sent email'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };
}
