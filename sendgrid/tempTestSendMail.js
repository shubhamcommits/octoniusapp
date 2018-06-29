// ======= TEMPORARY TESTING =========
const sendMail = require('./transactionalEmail');
	
// Create dummies:
const user = {
	email: 'octonius-test@pm.me',
	name: 'Jonion'
};

const admin = {
	email: 'octonius@example.com',
	name: 'Admin'
};

const support = {
	email: 'supportoctonius@example.com',
	name: 'Support'
};

// Pass sendgrid API Key 
 process.env.SENDGRID_KEY = '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';

// -----> Fire the email!!!! <-------
sendMail('signup', user.email, user.name, admin.email, admin.name, support.email, support.name);

