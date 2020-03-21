import subjects from "./templates/subjects";
import defaults from "./defaults";
import ejs from 'ejs';
import fs from 'fs';
import http from 'axios';
import moment from "moment";
import { Resetpwd } from "../../api/models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";

/*	=============
 *	-- HELPERS --
 *	=============
 */

const generateEmailBody = async (type: any, data: any) => {
    try {
        // Pass email data to the template
        const templateStr = fs.readFileSync(`${__dirname}/templates/${type}.ejs`);
        const body = ejs.render(templateStr.toString(), data);

        return body;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
};

/*	===================
 *	-- MAIN FUNCTION --
 *	===================
 */

const sendMail = async (emailBody: any, emailData: any, scheduled: any = {}) => {
    try {
        // Sendgrid API settings
        const config: any = {
            url: '/v3/mail/send',
            method: 'post',
            baseURL: 'https://api.sendgrid.com',
            port: null,
            transformRequest: [function (data) {
                return JSON.stringify(data);
            }],
            headers: {
                authorization: `Bearer ${process.env.SENDGRID_KEY}`,
                'content-type': 'application/json'
            },
            data: {
                personalizations: [
                    {
                        to: [
                            {
                                email: emailData.toEmail,
                                name: emailData.toName
                            }
                        ],
                        subject: emailData.subject
                    }
                ],
                from:
                {
                    email: defaults.fromEmail,
                    name: defaults.fromName
                },
                reply_to: {
                    email: emailData.replyToEmail || defaults.replyToEmail,
                    name: emailData.replyToName || defaults.replyToName
                },
                content: [
                    {
                        type: 'text/html',
                        value: emailBody
                    }
                ]
            }
        };


        // if we're creating an email that is scheduled in the future, then we add the property send_at to config
        //  we add 360 seconds to avoid the bussiest moment
        if (scheduled.date) {
            config.data.send_at = moment(scheduled.date).unix() + 360;
        }

        // Fire the request to sendgrid server, check the reponse
        const res = await http.request(config);
        return res;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
}

/*	===================
 *	-- AUTH FUNCTIONS --
 *	===================
 */

// Sign up confirmation email
const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { user } = req.body;

        // Define emailType for templates
        const emailType = 'signup';

        // Generate email data
        const emailData = {
            subject: subjects[emailType],
            toName: user.first_name,
            toEmail: user.email,
            workspace: user.workspace_name
        };

        // Generate email body from template
        const emailBody = await generateEmailBody(emailType, emailData);

        // Send email
        await sendMail(emailBody, emailData);

        // Send status 200 response
        return res.status(200).json({
            message: `Sign-up email sent!`,
        });

    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);

        return sendError(res, err, 'Internal Server Error!', 500);
    }
}

/*	=========================
 *	-- WORKSPACE FUNCTIONS --
 *	=========================
 */

// 	New workspace confirmation email
const newWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { workspace } = req.body;

        // Defining emailType
        const emailType = 'newWorkspace';

        // Generate email data
        const emailData = {
            subject: subjects[emailType],
            toName: workspace.owner_first_name,
            toEmail: workspace.owner_email,
            workspace: workspace.workspace_name
        };

        // Generate email body from template
        const emailBody = await generateEmailBody(emailType, emailData);

        // Send email
        await sendMail(emailBody, emailData);

        // Send status 200 response
        return res.status(200).json({
            message: `New Workspace email sent!`,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);

        return sendError(res, err, 'Internal Server Error!', 500);
    }
}

/*	=========================
 *	-- PASSWORD FUNCTIONS --
 *	=========================
 */

// send mail to user to reset their password
const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { workspace, user } = req.body;

        const resetPwdData = {
            user: user._id
        };

        // so this is a new document we create whenever a user requests a password reset
        // it has user and _id properties. We use user to show the info and we use the _id
        // to add it to link in the mail.
        const newResetPwdDoc = await Resetpwd.create(resetPwdData);

        // this is the link in the email that users can click that will lead them to the page where they can
        // reset their password
        const resetPwdlink = `${defaults.resetPwdLink}/${newResetPwdDoc._id}`;

        const emailType = 'resetPassword';

        // Preparing the email data
        const emailData = {
            subject: subjects[emailType],
            toName: user.first_name,
            toEmail: user.email,
            workspace: workspace.workspace_name,
            link: resetPwdlink
        };

        // Generate email body from template
        const emailBody = await generateEmailBody(emailType, emailData);

        // Send email
        await sendMail(emailBody, emailData);

        // Send status 200 response
        return res.status(200).json({
            message: `Reset password email sent!`,
        });

    } catch (err) {
        console.log(err);

        return sendError(res, err, 'Internal Server Error!', 500);
    }
}

// Welcome user when user is added to a group
const joinedGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { groupData, adminData, memberData } = req.body

        const emailType = 'joinedGroup';

        // Generate email data
        const emailData = {
            subject: subjects[emailType],
            toName: memberData.first_name,
            toEmail: memberData.email,
            fromName: adminData.first_name,
            fromEmail: adminData.email,
            group: groupData.group_name,
            workspace: groupData.workspace_name,
            link: defaults.signinLink
        };

        // Generate email body from template
        const emailBody = await generateEmailBody(emailType, emailData);

        // Send email
        await sendMail(emailBody, emailData);

        // Send status 200 response
        return res.status(200).json({
            message: `Join Group email sent!`,
        })

    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);

        return sendError(res, err, 'Internal Server Error!', 500);
    }
};

export {

    // Signup
    signup,

    // New Workspace
    newWorkspace,

    // Reset Password
    resetPassword,

    // Join Group
    joinedGroup
}