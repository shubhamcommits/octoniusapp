const ejs = require('ejs');
const fs = require('fs');
const http = require('axios');
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

const sendMail = async (emailData, toEmail, toName, fromEmail, fromName, replyToEmail, replyToName) => {
	console.log(`Sending transactional email to ${toName}...`);

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
								email: toEmail,
								name: toName
							} 
						],
						subject: emailData.subject 
					} 
				],
				from: 
				{
					email: fromEmail || defaults.fromEmail,
					name: fromName || defaults.fromName
				},
				reply_to: {
					email: replyToEmail || defaults.replyToEmail,
					name: replyToName || defaults.replyToName
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
const joinWorkspace = async (toEmail, toName, fromEmail, fromName, replyToEmail, replyToName, workspace, link) => {
	try {
		const emailData = await generateEmailData('joinWorkspace', toName, fromName, workspace, null, link);

		const send = await sendMail(emailData, toEmail, toName, fromEmail, fromName, replyToEmail, replyToName);

		if (send.status === 202) {
			console.log(`Email sent to ${toName}`);
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
const signup = async (toEmail, toName, fromEmail, fromName, replyToEmail, replyToName, workspace) => {
	try {
		const emailData = await generateEmailData('signup', toName, fromName, workspace);

		const send = await sendMail(emailData, toEmail, toName, fromEmail, fromName, replyToEmail, replyToName);

		if (send.status === 202) {
			console.log(`Email sent to ${toName}`);
		}

	} catch (err) {
		console.log(err);
	}
};

// EMAIL ==> Task assigned to a user
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
		// toEmail, toName, fromEmail, fromName, replyToEmail, replyToName

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

