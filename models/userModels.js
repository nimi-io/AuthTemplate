const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		min: 6,
		max: 250,
	},
	email: {
		type: "string",
		required: true,
		default: "",
		unique: true,
		lowercase: true,
		//	validate: [validator.isEmail],
		min: 6,
		max: 250,
	},
	password: {
		type: String,
		required: true,
		min: 6,
		max: 1024,
	},
	role: {
		type: "string",
		enum: ["user", "admin", "Caterer", "Dev"],
		default: "user",
	},
	createdDate: {
		type: Number,
		required: false,
	},
	// userID: {
	// 	type: String,
	// 	required: true,
	// 	min: 6,
	// 	max: 1024,
	// },
	uniqueString: {
		type: String,
		required: false,
		min: 6,
		max: 1024,
	},
	uniqueStringCreateAt: {
		type: String,
		required: false,
		min: 6,
		max: 1024,
	},
	uniqueStringExpiresAt: {
		type: Number,
		required: false,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
});

userSchema.pre("save", function (next) {
	const date = Date.now();
	if (!this.isModified("password")) return next();

	this.password = bcrypt.hash(this.password, 12);
	this.uniqueStringExpiresAt = date + 21600000;
	this.createdDate = date;

	next();
});

module.exports = mongoose.model("Users", userSchema);
