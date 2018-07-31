module.exports = {
	fromEmail: 'dev@octonius.com',
	fromName: 'Team Octonius',
	replyToEmail: 'support@octonius.com',
	replyToMail: 'Support',
	signupLink: process.env.NODE_ENV === 'development' ?
	'http://localhost:3000/#/signup' :
	'https://octhub.com/#/signup'
};
