const express = require("express");
const router = express.Router();
const mailController = require("../controllers/mailController");

router.post("/send-mail", mailController.sendMail);
router.post("/contact", mailController.sendContactMail);

module.exports = router;
