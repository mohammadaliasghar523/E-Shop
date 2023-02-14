function errorHandler(err, req, res, next) {
	if (err.name === "UnauthorizedError") {
		// jwt authentication error
		return res
			.status(500)
			.json({ success: false, message: "The user is not authorized" });
	}
	if (err.name === "ValidationError") {
		// validation error
		return res.status(500).json({ success: false, message: err });
	}
	// default server error
	console.error(err);
	return res.status(500).json({ success: false, message: err });
}

module.exports = errorHandler;
