const User = require("../models/userModels");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const {
	registerValidations,
	loginValidations,
} = require("../utils/validation");
const { Schema } = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const { v4: uuidv4 } = require("uuid");

const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../utils/emails");

exports.signup = catchAsync(async (req, res, next) => {
	const date = Date.now();
	const { error } = registerValidations(req.body);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const emailExist = await User.findOne({ email: req.body.email });
	if (emailExist) return next(new AppError("Email Already Exists", 400));

	const user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		roles: req.body.roles,
	});

	const savedUser = await user.save();
	console.log("lol");
	const uniqueString = uuidv4 + savedUser._id;

	console.log(savedUser._id);

	const saltRounds = 1;
	const hashedUniqueString = await bcrypt.hash(uniqueString, saltRounds);

	const verifyEmail = await sendVerificationEmail(
		savedUser._id,
		savedUser.email,
		hashedUniqueString,
	);

	if (verifyEmail) {
		await User.updateOne(savedUser, {
			$set: {
				uniqueString: hashedUniqueString,
				uniqueStringCreateAt: date,
				uniqueStringExpiresAt: date + 21600000,
			},
		});
	} else {
		return next(new AppError("cannot verify email", 401));
	}

	res.status(200).send({
		message: "email verification sent",
		status: "pending verification",
		user: savedUser._id,
	});
});

exports.signIn = catchAsync(async (req, res, next) => {
	const { error } = loginValidations(req.data);
	if (error) return next(new AppError(error.details[0].message, 400));

	const emailExist = await User.findOne({ email: req.body.email });
	if (!emailExist) return next(new AppError("User not Found", 400));

	if (!emailExist.isVerified)
		return next(new AppError("Kindly Verify your emial", 401));

	const validatePassword = await bcrypt.compare(
		req.body.password,
		emailExist.password,
	);
	if (!validatePassword)
		return next(new AppError("Invalid Usename or Password", 400));

	const token = jwt.sign({ _id: emailExist._id }, process.env.TOKEN_SECRET);
	res.header("auth-token", token).send({ user: emailExist, token: token });
});

exports.verifyUser = catchAsync(async (req, res, next) => {
	const token = req.header("auth-token")
		? req.header("auth-token")
		: req.body.token;

	if (!token) return next(new AppError("Access Denied", 401));
	try {
		const verified = jwt.verify(token, process.env.TOKEN_SECRET);
	} catch (error) {
		if (error) return next(new AppError("Kindly login again", 401));
	}
	console.log("user has been verifired");
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.body.role)) {
			return new AppError(
				"You do not have permission to perform this action",
				403,
			);
		}
	};
	next();
};

exports.emailVerify = async (req, res, next) => {
	const date = Date.now();
	let { userId, uniqueString } = req.params;

	const findUser = await User.findOne({ userId });
	const hashedStringFromDb = findUser.uniqueString;
	console.log(findUser.uniqueStringExpiresAt - date);
	if (findUser.uniqueStringExpiresAt > date) {
		return next(
			new AppError("Verification Link Expired, Kindly SignUp again", 401),
		);
	}

	// const compare = await bcrypt.compare(uniqueString, hashedStringFromDb);
	// if (!compare) {
	// 	next(new AppError("Invalid Verification Link", 401));
	// }

	console.log(findUser)

	const updateUser = await User.updateOne(findUser, {
		$set: { isVerified: true },
	});
	console.log("this is getting here: ", req.params);

	if (!updateUser) {
		await User.deleteOne(findUser);
		next(
			new AppError(
				"An error occurred while updating, Kndly Restart The process",
			),
		);

	}
	console.log("UserUpdated: " + JSON.stringify(updateUser));


	res.status(200).send("User Verification Successfully Updated");
};
