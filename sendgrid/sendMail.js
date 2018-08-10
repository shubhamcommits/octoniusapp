const ejs = require('ejs');
const fs = require('fs');
const http = require('axios');

const Group = require('../models/group');
const User = require('../models/user');
const Workspace = require('../models/workspace');
const Post = require('../models/post');
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
		console.log(err);
	}
};


/*	===================
 *	-- MAIN FUNCTION --
 *	===================
 */

const sendMail = async (emailBody, emailData) => {
	console.log(`Sending transactional email to ${emailData.toName}...`);

	try {
		// Sendgrid API settings
		const config = {
			url: '/v3/mail/send',
			method: 'post',
			baseURL: 'https://api.sendgrid.com',
			'port': null,
			transformRequest: [function (data) {
				strData = JSON.stringify(data);
				return strData;
			}],
			headers: {
				'authorization': 'Bearer ' + process.env.SENDGRID_KEY,
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

		if (send.status === 202) {
			console.log(`Email sent to ${emailData.toName}`);
		}

	} catch (err) {
		console.log(err);
	}
};

// 	New workspace confirmation email 
const newWorkspace = async (toEmail, toName, fromEmail, fromName, replyToEmail, replyToName, workspace) => {
	try {
		const emailData = await generateEmailData('newWorkspace', toName, fromName, workspace);

		const send = await sendMail(emailData, toEmail, toName, fromEmail, fromName, replyToEmail, replyToName);

		if (send.status === 202) {
			console.log(`Email sent to ${toName}`);
		}

	} catch (err) {
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
			workspace: user.workspace_name,
		};

		// Generate email body from template
		const emailBody = await generateEmailBody(emailType, emailData);

		// Send email
		const send = await sendMail(emailBody, emailData);

		if (send.status === 202) {
			console.log(`Email sent to ${emailData.toName}`);
		}

	} catch (err) {
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

		if (send.status === 202) {
			console.log(`Email sent to ${to.first_name}`);
		}

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
	newWorkspace,
	signup,
	taskAssigned
};

