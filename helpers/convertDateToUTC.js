const moment = require('moment');

const toUTC = (date) => {

	// Create date in moment.js default format 
	let dateFormatted = moment(date).format();
	// Convert it to UTC
	let dateUTCConverted = moment.utc(dateFormatted).format();

	// Debugging:
	console.log(`\nDate before formatting:\n ${date}`);
	console.log(`\nDate after formatting:\n ${dateFormatted}`);
	console.log(`\nDate after UTC conversion:\n ${dateUTCConverted}`);

	return dateUTCConverted;
};

module.exports = toUTC;
