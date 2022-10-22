const { merge } = require("@hapi/joi/lib/values");
const nodemailer = require("nodemailer");
const catchAsync = require("./catchAsync");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const bcrypt = require("bcryptjs");
const User = require("../models/userModels");

//unique strings
console.log(process.env.USER_AUTH);
var transporter = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: process.env.USER_AUTH,
		pass: process.env.USER_AUTH_PASS,
	},
});

transporter.verify((error, success) => {
	if (error) {
		console.log(error);
	} else {
		console.log("Ready for messages");
	}
});

const sendVerificationEmail = async function (id, email, uniqueString) {
	const currentURL = "http://localhost:3001";


	const mailOptions = {
		from: process.env.USER_AUTH,
		to: email,
		subject: " Email Verification",
		html: `
		<html>
		<p>Verify your email to complete the signup and login to your account</p>
		<p>This link <b>expires in 6 hours</b></p>
		<p>Kindy Verify Via: <a href=${
			currentURL + "/api/v1/users/verify/" + id + "/" + uniqueString
		}>Here</a></p>
		</html>
		`,
	};

	

	transporter.sendMail(mailOptions);

	return true;
};

module.exports.sendVerificationEmail = sendVerificationEmail;
