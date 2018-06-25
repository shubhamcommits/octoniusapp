var http = require("https");

var options = {
	"method": "POST",
	"hostname": "api.sendgrid.com",
	"port": null,
	"path": "/v3/mail/send",
	"headers": {
		"authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
		"content-type": "application/json"
	}
};

var req = http.request(options, function (res) {
	var chunks = [];

	res.on("data", function (chunk) {
		chunks.push(chunk);
	});

	res.on("end", function () {
		var body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

module.exports = {
	send() {
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
				}
			}
		));

		req.end();
	}
}

