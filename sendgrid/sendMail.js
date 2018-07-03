const ejs 		 = require('ejs');
const fs 			 = require('fs');
const http		 = require('axios');
const subjects = require('./templates/subjects');
const defaultEmails = require('./defaultEmails');


/*	===================
 *	-- MAIN FUNCTION --
 *	===================
 */

const sendMail = async (templateName, toEmail, toName, fromEmail, fromName, replyToEmail, replyToName) => {
	console.log(`Sending transactional email to ${toName}...`);

	try {
		// Excratc subject, based on templateName
		const subject = subjects[templateName];

		// Pass user data to the template
		const templateStr = await fs.readFileSync(`./sendgrid/templates/${templateName}.ejs`);
		const templateHtml = await ejs.render(templateStr.toString(), {name: toName});

		// Sendgrid API settings
		const config = {
			url: '/v3/mail/send',
			method: 'post',
			baseURL: 'https://api.sendgrid.com',
			'port': null,
			transformRequest: [function(data) {
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
						subject: subject 
					} 
				],
				from: 
				{
					email: fromEmail || defaultEmails.fromEmail,
					name: fromName || defaultEmails.fromName
				},
				reply_to: {
					email: replyToEmail || defaultEmails.replyToEmail,
					name: replyToName || defaultEmails.replyToName
				},
				content: [
					{ 
						type: 'text/html',
						value: templateHtml
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

// Sign up confirmation email
const signup = async (toEmail, toName, fromEmail, fromName, replyToEmail, replyToName) => {
	try {
		const template = 'signup';

		const send = await sendMail(template, toEmail, toName, fromEmail, fromName, replyToEmail, replyToName);

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
	signup,
};

