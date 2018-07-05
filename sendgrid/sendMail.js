const ejs = require('ejs');
const fs = require('fs');
const http = require('axios');
const subjects = require('./templates/subjects');
const defaultEmails = require('./defaultEmails');


/*	=============
 *	-- HELPERS --
 *	=============
 */

const generateEmailData = async (templateName, user, admin, workspace, link) => {
	try {
		const data = {
			user,
			admin,
			workspace,
			link
		};

		// Excratc subject, based on templateName
		const subject = subjects[templateName];

		// Pass email data to the template
		const templateStr = await fs.readFileSync(`./sendgrid/templates/${templateName}.ejs`);
		const content = await ejs.render(templateStr.toString(), data);

		return {
			subject,
			content
		};
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
<<<<<<< HEAD
			data: {
				personalizations: [{
					to: [{
						email: toEmail,
						name: toName
					}],
					subject: subject
				}],
				from: {
||||||| merged common ancestors
			data: { 
				personalizations: [
					{
						to: [ 
							{ 
								email: toEmail,
								name: toName
							} 
						],
						subject: subject 
					} 
				],
				from: 
				{
=======
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
>>>>>>> create generateEmailData, finish methods creation joinWorkspace and newWorkspace, send signup and newWorkspace email
					email: fromEmail || defaultEmails.fromEmail,
					name: fromName || defaultEmails.fromName
				},
				reply_to: {
					email: replyToEmail || defaultEmails.replyToEmail,
					name: replyToName || defaultEmails.replyToName
				},
<<<<<<< HEAD
				content: [{
					type: 'text/html',
					value: templateHtml
				}]
||||||| merged common ancestors
				content: [
					{ 
						type: 'text/html',
						value: templateHtml
					}
				]
=======
				content: [
					{ 
						type: 'text/html',
						value: emailData.content
					}
				]
>>>>>>> create generateEmailData, finish methods creation joinWorkspace and newWorkspace, send signup and newWorkspace email
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
		const emailData = await generateEmailData('joinWorkspace', toName, fromName, workspace, link);

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


/*	====================
 *	-- EXPORT METHODS --
 *	====================
 */

module.exports = {
	joinWorkspace,
	newWorkspace,
	signup
};

