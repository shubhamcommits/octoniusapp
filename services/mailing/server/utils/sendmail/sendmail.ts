import subjects from "./templates/subjects";
import defaults from "./defaults";
import ejs from 'ejs';
import fs from 'fs';
import http from 'axios';
import moment from "moment";
import { Resetpwd, User, Group, Workspace } from "../../api/models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";
import { Readable } from 'stream';

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
}

/**
 * This function is acting as a helper function for post mails
 * @param post 
 * @param emailType 
 */
const postMailHelper = async (post: any, emailType: any, user?: any) => {

  // Details of user to be sent mail to
  var to: any, from: any, group: any;

  // Fetch the details of assignee
  if (post.type === 'task')
    to = post.task._assigned_to

  // Else this is post mention
  else if (post.type === 'normal')
    to = user

  // Fetch the Email Sender Details or task assigner
  from = post._posted_by

  // Fetch the Group Details
  group = post._group

  // Prepare Email Data
  const emailData = {
    subject: subjects[emailType],
    toName: to.first_name,
    toEmail: to.email,
    fromName: from.first_name,
    fromEmail: from.email,
    postTitle: post.title,
    // postContent: post.content,
    workspace: group.workspace_name,
    group: group.group_name,
    link: defaults.signinLink,
    postLink: defaults.postLink(group._id, post._id)
  }

  // Generate email body from template
  const emailBody = await generateEmailBody(emailType, emailData);

  // Send email as a task reminder post
  if (post.type === 'task' && emailType === 'scheduleTaskReminder')
    await sendMail(emailBody, emailData, { date: moment.utc(post.task.due_to, 'YYYY-MM-DD').startOf('day').format() })

  // Send email to task post
  else if (post.type === 'task' && (emailType === 'taskAssigned' || emailType === 'taskReassigned'))
    await sendMail(emailBody, emailData)

  // Else send mail to normal post
  else if (post.type === 'normal')
    await sendMail(emailBody, emailData);

}

/**
 * This function is acting as a helper function for event posts
 * @param post 
 * @param emailType 
 */
const eventMailHelper = async (post: any, emailType: any) => {

  // Fetch the Email Sender Details
  const from: any = post._posted_by

  // Fetch the Group Details
  const group: any = post._group

  // Let usersStream
  let userStream: any;

  // If all members are selected
  if (post.assigned_to.includes('all')) {

    // Create Readble Stream from the Event Assignee
    userStream = Readable.from(await User.find({
      _groups: post._group
    }).select('first_name _account'));
  } else {

    // Create Readble Stream from the Event Assignee
    userStream = Readable.from(post._assigned_to);
  }

  // Send Mails to each assigned user
  userStream.on('data', async (user: any) => {

    // Prepare Email Data
    const emailData = {
      subject: subjects[emailType],
      toName: user.first_name,
      toEmail: user._account.email,
      fromName: from.first_name,
      fromEmail: from._account.email,
      postTitle: post.title,
      // postContent: post.content,
      workspace: group.workspace_name,
      group: group.group_name,
      link: defaults.signinLink,
      postLink: defaults.postLink(group._id, post._id)
    };

    // Generate email body from template.
    const emailBody = await generateEmailBody(emailType, emailData);

    // Send email to event reminder
    if (emailType === 'scheduleEventReminder')
      await sendMail(emailBody, emailData, { date: moment.utc(post.event.due_to, 'YYYY-MM-DD').startOf('day').format() })

    // Else only event assigned
    else if (emailType === 'eventAssigned')
      await sendMail(emailBody, emailData)

  })
}

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
      _account: user._id
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

// Join workspace invitation email
const joinWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emailType = 'joinWorkspace';
    const { data } = req.body;
    // Generate email data
    const from: any = await User.findById({ _id: data.from });
    const workspace: any =  data.workspace

    const emailData = {
      subject: subjects[emailType],
      toName: '',
      toEmail: data.email,
      fromName: from.first_name,
      fromEmail: from.email,
      workspace: workspace,
      accessCode: data.access_code,
      link: defaults.signupLink(data.email)
    };

    // Generate email body from template
    const emailBody = await generateEmailBody(emailType, emailData);

    // Send email
    const send = await sendMail(emailBody, emailData);
    return res.status(200).json({
      message: `Join workspace email sent!`,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    return sendError(res, err, 'Internal Server Error!', 500);
  }
};


/**
 * =========================
 *           MENTIONS
 * ==========================
 */

/**
 * This function is responsible for sending the mail to the mentioned user
 * @param { body: { post, user } } req 
 * @param res 
 * @param next 
 */
const userMentionedPost = async (req: Request, res: Response, next: NextFunction) => {

  // Post and User Data from request
  const { post, user } = req.body;

  try {

    // Defining Email Type for templates
    const emailType = 'userMentionedPost';

    // Send Mail to task assignee
    await postMailHelper(post, emailType, user)

    // Send status 200 response
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
    
    const emailType = 'userMentionedComment';

    // Generate email data
    //  proposal to perhaps load these three lines parallel instead of waterfall, since their outcomes are not depending on each other
    const to: any = await User.findById({ _id: user });
    const from: any = await User.findById({ _id: comment._commented_by._id });
    const group: any = await Group.findById({ _id: post._group });

    const emailData = {
      subject: subjects[emailType],
      toName: to.first_name,
      toEmail: to.email,
      fromName: from.first_name,
      fromEmail: from.email,
      // commentContent: comment.content,
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


/**
 * This function is responsible for sending email to the assigned user of task
 * @param { body:{ post } }req 
 * @param res 
 * @param next 
 */
const taskAssigned = async (req: Request, res: Response, next: NextFunction) => {

  // Post object from request
  const { post } = req.body;

  try {

    // Defining Email Type for templates
    const emailType = 'taskAssigned';

    // Send Mail to task assignee
    await postMailHelper(post, emailType);

    // Send status 200 response
    return res.status(200).json({
      message: 'User task mail sent!'
    })

  } catch (err) {
    // eslint-disable-next-line no-console
    return sendError(res, new Error(err), 'Internal Server Error!', 500);
  }
};


/**
 * This function is responsible for sending email to the assigned user of task(reassigning mail)
 * @param { body:{ post } }req 
 * @param res 
 * @param next 
 */
const taskReassigned = async (req: Request, res: Response, next: NextFunction) => {

  // Post object from request
  const { post } = req.body;

  try {

    // Defining Email Type for templates
    const emailType = 'taskReassigned';

    // Send Mail to task assignee
    await postMailHelper(post, emailType);

    // Send status 200 response
    return res.status(200).json({
      message: 'User task reassigned mail sent!'
    })

  } catch (err) {
    // eslint-disable-next-line no-console
    return sendError(res, new Error(err), 'Internal Server Error!', 500);
  }
};


// send an email when a task is completed
const userCompletedTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userWhoChangedStatusId, post } = req.body;
    const emailType = 'userCompletedTask';

    // Generate email data
    const appointer: any = await User.findById({ _id: post._posted_by });
    const appointee: any = await User.findById({ _id: post.task._assigned_to });
    const userWhoChangedStatus: any = await User.findById({ _id: userWhoChangedStatusId });
    const group: any = await Group.findById({ _id: post._group });

    // we want to send emails to the appointer and the appointee
    // if they are the same person then we only want to send one email
    const destinationUsers = appointer._id === appointee._id ? [appointer] : [appointer, appointee];

    destinationUsers.forEach(async (user) => {
      const emailData = {
        subject: subjects[emailType],
        appointeeName: appointee.first_name,
        appointerName: appointer.first_name,
        userWhoChangedStatusName: userWhoChangedStatus.first_name,
        toName: user.first_name,
        toEmail: user.email,
        contentTitle: post.title,
        // contentPost: post.content,
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
        message: 'User Task Completed mail sent'
      });
    });
  } catch (err) {
    return sendError(res, new Error(err), 'Internal Server Error!', 500);
  }
};

/**
 * This function is responsible for sending email to the assigned users of event
 * @param { body:{ post } }req 
 * @param res 
 * @param next 
 */
const eventAssigned = async (req: Request, res: Response, next: NextFunction) => {

  // Post object from request
  const { post } = req.body;

  try {

    // Defining Email Type for templates
    const emailType = 'eventAssigned';

    // Send Mail to all the event assignee
    await eventMailHelper(post, emailType);

    return res.status(200).json({
      message: 'Event assigned mail sent'
    });

  } catch (err) {
    // eslint-disable-next-line no-console
    return sendError(res, new Error(err), 'Internal Server Error!', 500);
  }
};

/**
 * =========================
 *          REMINDERS
 * ==========================
 */

/**
 * This function is responsible for sending task reminder to the user
 * @param { body: { post } } req 
 * @param res 
 * @param next 
 */
const scheduleTaskReminder = async (req: Request, res: Response, next: NextFunction) => {

  // Post object from request
  const { post } = req.body

  try {

    // Defining Email Type for templates
    const emailType = 'scheduleTaskReminder';

    // Send Mail to task assignee
    await postMailHelper(post, emailType);

    // Send status 200 response
    return res.status(200).json({
      message: 'User task reminder mail sent!'
    })

  } catch (err) {
    return sendError(res, new Error(err), 'Internal Server Error!', 500)
  }
}

/**
 * This function is responsible for sending event reminder to the user
 * @param { body: { post } } req 
 * @param res 
 * @param next 
 */
const scheduleEventReminder = async (req: Request, res: Response, next: NextFunction) => {

  // Post object from request
  const { post } = req.body;

  try {

    // Defining Email Type for templates
    const emailType = 'scheduleEventReminder';

    // Send Mail to all the event assignee
    await eventMailHelper(post, emailType);

    return res.status(200).json({
      message: 'Event reminder mail sent!'
    })

  } catch (err) {
    return sendError(res, new Error(err), 'Internal Server Error!', 500);
  }
}


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
  eventAssigned,

  // Workspace Joined
  joinWorkspace,

  // Task Reassigned
  taskReassigned,

  // User Task Completed
  userCompletedTask
}