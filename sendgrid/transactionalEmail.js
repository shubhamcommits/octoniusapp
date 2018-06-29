/* TO DO:
 *	- make sendMail an Async function, and catch errors
 *  before crashing the server
 * 	- test it from the form too, call the function when 
 * 	new user signup
 * 	- provide default fromName & Email, replyName & Email
 * 	in case it's not fullfilled
 * 	- create functions for each template model
 *	- provide support for the other templates
 *	- refactor
 */

const ejs 		 = require('ejs');
const fs 			 = require('fs');
const http		 = require('https');
const subjects = require('./templates/subjects');

// -- MAIN FUNCTION --
const sendMail = (templateName, toEmail, toName, fromEmail, fromName, replyEmail, replyName) => {
	console.log(`-- sendMail start --`);
	console.log(`Sending transactional email to ${toName}...`);
	
	// Sendgrid API settings
	const options = {
		"method": "POST",
		"hostname": "api.sendgrid.com",
		"port": null,
		"path": "/v3/mail/send",
		"headers": {
			"authorization": "Bearer " + process.env.SENDGRID_KEY,
			"content-type": "application/json"
		}
	};

	// Make the request to sendgrid server 
	const req = http.request(options, (res) => {
		const chunks = [];

		res.on("data", (chunk) => {
			chunks.push(chunk);
		});

		// Log errors)
		res.on("end", () => {
			const body = Buffer.concat(chunks);
			console.log(body.toString());
			console.log(`-- sendMail end --`);
		});
	});

	// Pass data to the template
	const templateStr = fs.readFileSync(`./templates/${templateName}.ejs`);
	const templateHtml = ejs.render(templateStr.toString(), {name: toName});

	// Excratc subject, based on templateName
	const subject = subjects[templateName];

	// Pass email content
	req.write(JSON.stringify(
		{ 
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
	));

	req.end();
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



