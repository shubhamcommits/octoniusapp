const moment = require('moment');

const toUTC = (date) => {

	// Throw error if there's null date argument
	if (!date) {
		throw new Error('You must provide a Date!');
	}

	// Create date in moment.js default format 
	let dateFormatted = moment(date).format();
	// Convert it to UTC
	let dateUTCConverted = moment.utc(dateFormatted).format();

	// Debugging: 
	// (uncomment the lines below to help debuging date conversion)
	console.log(`\nDate before formatting:\n ${date}`);
	console.log(`\nDate after formatting:\n ${dateFormatted}`);
	console.log(`\nDate after UTC conversion:\n ${dateUTCConverted}`);

	return dateUTCConverted;
};

module.exports = toUTC;
