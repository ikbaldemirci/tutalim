const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
} = require("../validations/authValidation");

router.post("/signup", validate(signup), authController.signup);
router.post("/login", validate(login), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.post("/forgot-password", validate(forgotPassword), authController.forgotPassword);
router.post("/reset-password/:token", validate(resetPassword), authController.resetPassword);
router.get("/verify/:token", validate(verifyEmail), authController.verifyEmail);
router.post("/verify/resend", authController.resendVerification);

module.exports = router;
