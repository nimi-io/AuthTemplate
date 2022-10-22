const jwt = require('jsonwebtoken');

const signToken = (id) => {
	return jwt.sign({ _id: id }, process.env.JWT_SECRET);
};

module.exports.signToken = signToken;