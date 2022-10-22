const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const email = require("../utils/emails");

router.route("/signup").post(authController.signup);
router.route("/signin").post(
	//	authController.verifyUser,

	//authController.restrictTo(["user", "admin", "Caterer", "Dev"]),
	authController.signIn,
);
router.route("/verify/:userID/:uniqueString").get(authController.emailVerify);

module.exports = router;