const http = require("https");
const signup = require("./templates/sign-up.js")

const sendTrMail = (template, to, from, replyTo) => {
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
		});
	});

	// Pass email content
	req.write(JSON.stringify(
		{ 
			personalizations: [
				{
					to: [ 
						{ 
							email: to.email,
							name: to.name
						} 
					],
					subject: template.subject 
				} 
			],
			from: 
			{
				email: from.email,
				name: from.name 
			},
			reply_to: {
				email: replyTo.email,
				name: replyTo.name
			},
			content: [
				{ 
					type: 'text/html',
					value: template.template
				}
			]
		}
	));

	req.end();
};

module.exports = sendTrMail;

// == TESTING !!
	
// Create dummies:
const user = {
	email: 'octonius-test@pm.me',
	name: 'Alexander'
};

const admin = {
	email: 'octonius@example.com',
	name: 'Admin'
};

const support = {
	email: 'supportoctonius@example.com',
	name: 'Support'
};

// Send email
sendTrMail(signup, user, admin, support);

