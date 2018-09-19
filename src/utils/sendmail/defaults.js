const generateLink = (linkType) => {
	return process.env.NODE_ENV === 'development' ?
	`http://localhost:3000/#/${linkType}` :
	`https://octhub.com/#/${linkType}`;
};

module.exports = {
	fromEmail: 'dev@octonius.com',
	fromName: 'Team Octonius',
	replyToEmail: 'support@octonius.com',
	replyToMail: 'Support',
	signupLink: generateLink('signup'),
	signinLink: generateLink('signin')
};
