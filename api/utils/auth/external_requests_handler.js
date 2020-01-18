const externalRequestHandler = {
    handleExternalRequest(req, res, next) {
        if (req.headers.externalkey === process.env.HEADER_EXTERNAL_KEY) {
            return next();
        }
        return res.status(404).json({
            message: '404 not found'
        });
    }
};

module.exports = externalRequestHandler;
