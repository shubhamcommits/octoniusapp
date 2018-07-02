// ======= TEMPORARY TESTING =========
const sendMail = require('./sendMail');
	
// Create dummies:
const user = {
	email: 'octonius-test@pm.me',
	name: 'Jouso'
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
sendMail('signup', user.email, user.name, admin.email, admin.name, support.email, support.name)
	.then((msg) => console.log(msg))
	.catch((err) => console.log(` ${err}`));


