/* TO DO:
 * 	- provide default fromName & Email, replyName & Email
 * 	in case it's not fullfilled
 * 	- create functions for each template model
 *	- provide support for the other templates
 *	- refactor
 *
 * 	- test it from the form too, call the function when 
 * 	new user signup
 * 	- test it from the form too, call the function when 
 * 	new user signup
 */

const ejs 		 = require('ejs');
const fs 			 = require('fs');
const http		 = require('axios');
const subjects = require('./templates/subjects');

// -- MAIN FUNCTION --
const sendMail = async (templateName, toEmail, toName, fromEmail, fromName, replyEmail, replyName) => {
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
					email: fromEmail,
					name: fromName 
				},
				reply_to: {
					email: replyEmail,
					name: replyName
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

		if (res.status === 202) {
			return `Email sent to ${toName}`;
		} 

	} catch (err) {
		console.log(err);
	}
};

// !! Exporting only for testing puposes !!
module.exports = sendMail;


// -- USABLE FUNCTIONS --
// (Export this object that will contains a method for each template case)
// module.exports = {
//	 signupMail() {
//	 
//	 },
//	 etc...,
//	 etc...,
// };



