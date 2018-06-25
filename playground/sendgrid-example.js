const http = require("https");

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

const req = http.request(options, function (res) {
	const chunks = [];

	res.on("data", function (chunk) {
		chunks.push(chunk);
	});

	res.on("end", function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

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
				type: 'text/plain',
				value: 'It is Working'
			}
		]
	}
));

req.end();
