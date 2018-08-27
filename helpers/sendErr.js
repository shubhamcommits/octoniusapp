const sendErr = (res, err, message, status) => {

	console.log(`\n⛔️ Error:\n ${err}`);

	return res.status(status || 500).json({
		message: message || 'Internal server error!',
		err
	});
};

module.exports = sendErr;
