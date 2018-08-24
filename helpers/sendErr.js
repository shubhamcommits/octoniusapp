const sendErr = (res, err, message) => {

	console.log(`\n⛔️ Error:\n ${err}`);

	return res.status(500).json({
		message: message || 'Internal server error!',
		err
	});
};

module.exports = sendErr;
