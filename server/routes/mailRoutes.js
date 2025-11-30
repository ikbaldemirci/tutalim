const express = require("express");
const router = express.Router();
const mailController = require("../controllers/mailController");

const validate = require("../middleware/validate");
const { sendMail, sendContactMail } = require("../validations/mailValidation");

router.post("/send-mail", validate(sendMail), mailController.sendMail);
router.post("/contact", validate(sendContactMail), mailController.sendContactMail);

module.exports = router;
