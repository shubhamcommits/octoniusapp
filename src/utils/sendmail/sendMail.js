const ejs = require('ejs');
const fs = require('fs');
const http = require('axios');

const {
  Group,
  Post,
  User,
  Workspace
} = require('../../api/models');

const subjects = require('./templates/subjects');
const defaults = require('./defaults');

/*	=============
 *	-- HELPERS --
 *	=============
 */

const generateEmailBody = async (type, data) => {
  try {
    // Pass email data to the template
    const templateStr = await fs.readFileSync(`${__dirname}/templates/${type}.ejs`);
    const body = await ejs.render(templateStr.toString(), data);

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

const sendMail = async (emailBody, emailData) => {
  try {
    // Sendgrid API settings
    const config = {
      url: '/v3/mail/send',
      method: 'post',
      baseURL: 'https://api.sendgrid.com',
      port: null,
      transformRequest: [function (data) {
        strData = JSON.stringify(data);
        return strData;
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
          email: emailData.fromEmail || defaults.fromEmail,
          name: emailData.fromName || defaults.fromName
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

    // Fire the request to sendgrid server, check the reponse
    const res = await http.request(config);
    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

/*	=====================
 *	-- METHODS TO USE  --
 *	=====================
 */

// Join workspace invitation email
const joinWorkspace = async (reqData) => {
  try {
    const emailType = 'joinWorkspace';

    // Generate email data
    const from = await User.findById({ _id: reqData.user_id });
    const workspace = await Workspace.findById({ _id: reqData.workspace_id });

    const emailData = {
      subject: subjects[emailType],
      toName: '',
      toEmail: reqData.email,
      fromName: from.first_name,
      fromEmail: from.email,
      workspace: workspace.workspace_name,
      link: defaults.signupLink
    };

    // Generate email body from template
    const emailBody = await generateEmailBody(emailType, emailData);

    // Send email
    const send = await sendMail(emailBody, emailData);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

// Welcome user when user is added to a group
const joinedGroup = async (memberId, groupData, adminId) => {
  try {
    const emailType = 'joinedGroup';

    // Generate email data

    const adminData = await User.findById({ _id: adminId });
    const memberData = await User.findById({ _id: memberId });

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
    const send = await sendMail(emailBody, emailData);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

// 	New workspace confirmation email
const newWorkspace = async (workspace) => {
  try {
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
    const send = await sendMail(emailBody, emailData);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

// Sign up confirmation email
const signup = async (user) => {
  try {
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
    const send = await sendMail(emailBody, emailData);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

// Send email when a task assigned to a user
const taskAssigned = async (taskPost) => {
  try {
    const emailType = 'taskAssigned';

    // Generate email data
    const to = await User.findById({ _id: taskPost.task._assigned_to });
    const from = await User.findById({ _id: taskPost._posted_by });
    const group = await Group.findById({ _id: taskPost._group });

    const emailData = {
      subject: subjects[emailType],
      toName: to.first_name,
      toEmail: to.email,
      fromName: from.first_name,
      fromEmail: from.email,
      workspace: group.workspace_name,
      group: group.group_name,
      link: defaults.signinLink
    };

    // Generate email body from template
    const emailBody = await generateEmailBody(emailType, emailData);

    // Send email
    const send = await sendMail(emailBody, emailData);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

// Send email when a task assigned to a user
const eventAssigned = async (eventPost) => {
  try {
    const emailType = 'eventAssigned';

    // Generate common email data
    const from = await User.findById({ _id: eventPost._posted_by });
    const group = await Group.findById({ _id: eventPost._group });


    for (const userId of eventPost.event._assigned_to) {
      const to = await User.findById({ _id: userId });

      // Generate email data
      const emailData = {
        subject: subjects[emailType],
        toName: to.first_name,
        toEmail: to.email,
        fromName: from.first_name,
        fromEmail: from.email,
        workspace: group.workspace_name,
        group: group.group_name,
        link: defaults.signinLink
      };

      // Generate email body from template
      const emailBody = await generateEmailBody(emailType, emailData);

      // Send email
      const send = await sendMail(emailBody, emailData);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

// send an email when a task is completed
const userCompletedTask = async (userWhoChangedStatusId, post) => {
  try {
    const emailType = 'userCompletedTask';

    // Generate email data
    const appointer = await User.findById({ _id: post._posted_by });
    const appointee = await User.findById({ _id: post.task._assigned_to });
    const userWhoChangedStatus = await User.findById({ _id: userWhoChangedStatusId });
    const group = await Group.findById({ _id: post._group });

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
        contentPost: post.content,
        workspace: group.workspace_name,
        group: group.group_name,
        link: defaults.signinLink,
        taskLink: defaults.taskLink(group._id, post._id)
      };

      // Generate email body from template
      const emailBody = await generateEmailBody(emailType, emailData);

      // Send email
      const send = await sendMail(emailBody, emailData);
    });
  } catch (err) {
    console.log(err);
  }
};

// Send an email when a user is mentioned in a post
const userMentionedPost = async (post, user) => {
  try {
    const emailType = 'userMentionedPost';

    // Generate email data
    //  proposal to perhaps load these three lines parallel instead of waterfall, since their outcomes are not depending on each other
    const to = await User.findById({ _id: user });
    const from = await User.findById({ _id: post._posted_by });
    const group = await Group.findById({ _id: post._group });

    const emailData = {
      subject: subjects[emailType],
      toName: to.first_name,
      toEmail: to.email,
      fromName: from.first_name,
      fromEmail: from.email,
      workspace: group.workspace_name,
      group: group.group_name,
      link: defaults.signinLink
    };

    // Generate email body from template
    const emailBody = await generateEmailBody(emailType, emailData);

    // Send email
    const send = await sendMail(emailBody, emailData);
  } catch (err) {
    console.log(err);
  }
};

// send an email when a user is mentioned in a comment
const userMentionedComment = async (comment, post, user) => {
  try {
    const emailType = 'userMentionedComment';

    // Generate email data
    //  proposal to perhaps load these three lines parallel instead of waterfall, since their outcomes are not depending on each other
    const to = await User.findById({ _id: user });
    const from = await User.findById({ _id: comment._commented_by });
    const group = await Group.findById({ _id: post._group });

    const emailData = {
      subject: subjects[emailType],
      toName: to.first_name,
      toEmail: to.email,
      fromName: from.first_name,
      fromEmail: from.email,
      workspace: group.workspace_name,
      group: group.group_name,
      link: defaults.signinLink
    };

    // Generate email body from template
    const emailBody = await generateEmailBody(emailType, emailData);

    // Send email
    const send = await sendMail(emailBody, emailData);
  } catch (err) {
    console.log(err);
  }
};

/*	====================
 *	-- EXPORT METHODS --
 *	====================
 */

module.exports = {
  joinWorkspace,
  joinedGroup,
  newWorkspace,
  signup,
  taskAssigned,
  eventAssigned,
  userMentionedComment,
  userMentionedPost,
  userCompletedTask
};
