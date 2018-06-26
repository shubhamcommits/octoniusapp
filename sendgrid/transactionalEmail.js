const http = require("https");
const signup = require("./templates/sign-up.js")

const sendTrMail = (template, emailData) => {
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
							email: 'octonius-test@pm.me',
							name: 'Octonius User' 
						} 
					],
					subject: 'Confirmation Mail, Testing!' 
				} 
			],
			from: 
			{
				email: 'octonius@example.com',
				name: 'Octonius Admin'
			},
			reply_to: {
				email: 'octonius@example.com', name: 'Cosmin The Boss'
			},
			content: [
				{ 
					type: 'text/html',
					value: template 
				}
			]
		}
	));

	req.end();
};

// == TESTING !!
sendTrMail(signup);

module.exports = sendTrMail;

