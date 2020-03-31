import subjects from "./templates/subjects";
import defaults from "./defaults";
import ejs from 'ejs';
import fs from 'fs';
import http from 'axios';
import moment from "moment";
import { Resetpwd, User, Group } from "../../api/models";
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


// =========================
//          MENTIONS
// ==========================

// Send an email when a user is mentioned in a post
const userMentionedPost = async (req: Request, res: Response, next: NextFunction) => {
    
    const { post, user } = req.body;
    
    try {
      const emailType = 'userMentionedPost';
  
      // Generate email data
      //  proposal to perhaps load these three lines parallel instead of waterfall, since their outcomes are not depending on each other
      const to:any = await User.findById({ _id: user });
      const from:any = await User.findById({ _id: post._posted_by });
      const group:any = await Group.findById({ _id: post._group });
  
      const emailData = {
        subject: subjects[emailType],
        toName: to.first_name,
        toEmail: to.email,
        fromName: from.first_name,
        fromEmail: from.email,
        postContent: post.content,
        workspace: group.workspace_name,
        group: group.group_name,
        link: defaults.signinLink,
        postLink: defaults.postLink(group._id, post._id)
      };
  
      // Generate email body from template
      const emailBody = await generateEmailBody(emailType, emailData);
  
      // Send email
      const send = await sendMail(emailBody, emailData);

      return res.status(200).json({
        message: 'User Mentioned Post mail sent'
      });
    } catch (err) {
      // Error Handling
      return sendError(res, new Error(err), 'Internal Server Error!', 500);
    }
  };
  
  // send an email when a user is mentioned in a comment
  const userMentionedComment = async (req: Request, res: Response, next: NextFunction) => {
      const { comment, post, user } = req.body;
    try {
      // const date = new Date();
      // const date2 = moment('2019-01-11', 'YYYY-MM-DD').startOf('day').format();
      // console.log(date2);
  
      const emailType = 'userMentionedComment';
  
      // Generate email data
      //  proposal to perhaps load these three lines parallel instead of waterfall, since their outcomes are not depending on each other
      const to:any = await User.findById({ _id: user });
      const from:any = await User.findById({ _id: comment._commented_by._id });
      const group:any = await Group.findById({ _id: post._group });
  
      const emailData = {
        subject: subjects[emailType],
        toName: to.first_name,
        toEmail: to.email,
        fromName: from.first_name,
        fromEmail: from.email,
        commentContent: comment.content,
        workspace: group.workspace_name,
        group: group.group_name,
        link: defaults.signinLink,
        postLink: defaults.postLink(group._id, post._id)
      };
  
      // Generate email body from template
      const emailBody = await generateEmailBody(emailType, emailData);
  
      // Send email
      const send = await sendMail(emailBody, emailData);
      return res.status(200).json({
        message: 'User Mentioned Post mail sent'
      });
    } catch (err) {
        return sendError(res, new Error(err), 'Internal Server Error!', 500);
    }
  };


  // Send email when a task assigned to a user
const taskAssigned = async (req: Request, res: Response, next: NextFunction) => {
    const { taskPost } = req.body;
    try {
      const emailType = 'taskAssigned';
  
      // Generate email data
      const to:any = await User.findById({ _id: taskPost.task._assigned_to });
      const from:any = await User.findById({ _id: taskPost._posted_by });
      const group:any = await Group.findById({ _id: taskPost._group });
  
      const emailData = {
        subject: subjects[emailType],
        toName: to.first_name,
        toEmail: to.email,
        fromName: from.first_name,
        fromEmail: from.email,
        contentTitle: taskPost.title,
        contentPost: taskPost.content,
        workspace: group.workspace_name,
        group: group.group_name,
        link: defaults.signinLink,
        taskLink: defaults.postLink(group._id, taskPost._id)
      };
  
      console.log('emailData', emailData);
  
      // Generate email body from template
      const emailBody = await generateEmailBody(emailType, emailData);
  
      // Send email
      const send = await sendMail(emailBody, emailData);
      return res.status(200).json({
        message: 'User Mentioned Post mail sent'
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      return sendError(res, new Error(err), 'Internal Server Error!', 500);
    }
  };


  // Send email when a task assigned to a user
const eventAssigned = async (req: Request, res: Response, next: NextFunction) => {
    const { eventPost } = req.body;
    try {
      const emailType = 'eventAssigned';
  
      // Generate common email data
      const from:any = await User.findById({ _id: eventPost._posted_by });
      const group:any = await Group.findById({ _id: eventPost._group });
  
  
      for (const userId of eventPost.event._assigned_to) {
        const to:any = await User.findById({ _id: userId });
  
        // Generate email data
        const emailData = {
          subject: subjects[emailType],
          toName: to.first_name,
          toEmail: to.email,
          fromName: from.first_name,
          contentTitle: eventPost.title,
          contentPost: eventPost.content,
          fromEmail: from.email,
          workspace: group.workspace_name,
          group: group.group_name,
          link: defaults.signinLink,
          postLink: defaults.postLink(group._id, eventPost._id)
        };
  
        // Generate email body from template
        const emailBody = await generateEmailBody(emailType, emailData);
  
        // Send email
        const send = await sendMail(emailBody, emailData);
        return res.status(200).json({
            message: 'User Mentioned Post mail sent'
          });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      return sendError(res, new Error(err), 'Internal Server Error!', 500);
    }
  };


  // =========================
//          REMINDERS
// ==========================

const scheduleTaskReminder = async (req: Request, res: Response, next: NextFunction) => {
    const { post } = req.body;
    try {
      const emailType = 'scheduleTaskReminder';
  
      const to:any = await User.findById({ _id: post.task._assigned_to });
      const from:any = await User.findById({ _id: post._posted_by });
      const group:any = await Group.findById({ _id: post._group });
  
      const emailData = {
        subject: subjects[emailType],
        toName: to.first_name,
        toEmail: to.email,
        fromName: from.first_name,
        fromEmail: from.email,
        postTitle: post.title,
        postContent: post.content,
        workspace: group.workspace_name,
        group: group.group_name,
        link: defaults.signinLink,
        postLink: defaults.postLink(group._id, post._id)
      };
  
      // Generate email body from template
      const emailBody = await generateEmailBody(emailType, emailData);
  
      // Send email
      const send = await sendMail(emailBody, emailData, { date: moment.utc(post.task.due_to, 'YYYY-MM-DD').startOf('day').format() });
      return res.status(200).json({
        message: 'User Mentioned Post mail sent'
      });
    } catch (err) {
        return sendError(res, new Error(err), 'Internal Server Error!', 500);

    }
  };
  
  const scheduleEventReminder = async (req: Request, res: Response, next: NextFunction) => {
      const { post } = req.body;
    try {
      const emailType = 'scheduleEventReminder';
  
      const from:any = await User.findById({ _id: post._posted_by });
      const group:any = await Group.findById({ _id: post._group });
  
      post.event._assigned_to.forEach(async (user) => {
        const to:any = await User.findById({ _id: user });
  
        const emailData = {
          subject: subjects[emailType],
          toName: to.first_name,
          toEmail: to.email,
          fromName: from.first_name,
          fromEmail: from.email,
          postTitle: post.title,
          postContent: post.content,
          workspace: group.workspace_name,
          group: group.group_name,
          link: defaults.signinLink,
          postLink: defaults.postLink(group._id, post._id)
        };
  
        // Generate email body from template.
        const emailBody = await generateEmailBody(emailType, emailData);
  
        // Send email
        const send = await sendMail(emailBody, emailData, { date: moment.utc(post.event.due_to, 'YYYY-MM-DD').startOf('day').format() });
        return res.status(200).json({
            message: 'User Mentioned Post mail sent'
          });
      });
    } catch (err) {
        return sendError(res, new Error(err), 'Internal Server Error!', 500);
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
    joinedGroup,

    // User Mentioned Post
    userMentionedPost,

    //User Mentioned Comment
    userMentionedComment,

    // Task Assigned
    taskAssigned,

    // Task Reminder
    scheduleTaskReminder,

    // Event Reminder
    scheduleEventReminder,

    // Event Assigned
    eventAssigned
}