const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
	const secret = process.env.SECRET_KEY;
	const algorithm = process.env.ALGORITHM;
	const api = process.env.API_URL;

	return jwt({
		secret,
		algorithms: [algorithm],
		isRevoked: isRevoked,
	}).unless({
		path: [
			{ url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
			{ url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
			{ url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
			`${api}/users/login`,
			`${api}/users/register`,
			// { url: /(.*)/ },
		],
	});
}

async function isRevoked(req, token) {
	if (!token.payload.isAdmin) {
		// console.log("in Admin check");
		return true;
	} else {
		// console.log("else check");

		return false;
	}
}
module.exports = authJwt;
