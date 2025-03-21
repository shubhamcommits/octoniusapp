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
            await Resetpwd.deleteOne({ _account: accountId });

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

            let { email } = req.body;

            // Search for the desired user
            const account = await Account.findOne({
                $and: [
                    { email: email }
                ]
            })
            .select('_id email first_name last_name').lean();

            // Error finding the user
            if (!account) {
                return sendError(res, new Error('We were unable to find an account with this email! Please try again.'), 'We were unable to find an account with this email! Please try again.', 401);
            }

            const users = await User.find({
                    _account: account._id
                })
                .select('first_name last_name')
                .populate('_workspace', '_id management_private_api_key')
                .lean();

            // Error finding the user
            if (!users || users.length == 0) {
                return sendError(res, new Error('We were unable to find an user with this email! Please try again.'), 'We were unable to find an user with this email! Please try again.', 401);
            }

            const userEmail = {
                _id: users[0]._id,
                first_name: account['first_name'],
                last_name: account['last_name'],
                email: account['email']
            }

            const resetPwdData = {
                _account: account._id
            };
          
            // so this is a new document we create whenever a user requests a password reset
            // it has user and _id properties. We use user to show the info and we use the _id
            // to add it to link in the mail.
            const newResetPwdDoc = await Resetpwd.create(resetPwdData);

            // Send email to user
            axios.post(`${process.env.MANAGEMENT_URL}/api/mail/reset-password`, {
                    API_KEY: users[0]._workspace['management_private_api_key'],
                    user: userEmail,
                    newResetPwdDocId: newResetPwdDoc._id
                })
                .catch((err)=>{
                    console.log(err)
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: 'successfully sent email'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };
}
