import { Request, Response } from 'express';
import { User, Workspace, Resetpwd, Account } from '../models';
import { sendError, PasswordHelper, axios } from '../../utils';
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
            const delResetPwdDoc: any = await Resetpwd.findOne({ _id: req.body.resetPwdId }).lean();

            if (!delResetPwdDoc) {
                return sendError(res, new Error('Your link is not valid'), 'Your link is not valid', 401);
            }

            // the user that requested the password reset
            let accountId = delResetPwdDoc._account._id || delResetPwdDoc._account;

            // Encrypting user password
            const passEncrypted: any = await passwordHelper.encryptPassword(req.body.password);

            // Error creating the password
            if (!passEncrypted) {
                return sendError(res, new Error('An error occurred trying to create the password, please choose another password!'), 'An error occurred trying to create the password, please choose another password!', 401);
            }

            //  save the encrypted password in the user document
            await Account.findByIdAndUpdate(
                {_id: accountId},
                { password: passEncrypted.password});

            // delete all the other reset pasword documents of this user
            await Resetpwd.remove({ _account: accountId });

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
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: account.email
            }

            const resetPwdData = {
                _account: user._id
            };
          
            // so this is a new document we create whenever a user requests a password reset
            // it has user and _id properties. We use user to show the info and we use the _id
            // to add it to link in the mail.
            const newResetPwdDoc = await Resetpwd.create(resetPwdData);

            // Send email to user
            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/reset-password`, {
                API_KEY: workspace.management_private_api_key,
                user: userEmail,
                workspace: workspace,
                newResetPwdDocId: newResetPwdDoc._id
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
