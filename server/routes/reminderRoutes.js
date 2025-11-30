const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");
const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const {
    createReminder,
    reminderIdParam,
    createPropertyReminder,
} = require("../validations/reminderValidation");

router.post("/", verifyToken, validate(createReminder), reminderController.createReminder);
router.get("/:userId", verifyToken, validate(reminderIdParam.userIdParam), reminderController.getReminders);
router.put("/:id/complete", verifyToken, validate(reminderIdParam), reminderController.completeReminder);
router.delete("/:id", verifyToken, validate(reminderIdParam), reminderController.deleteReminder);
router.post(
    "/property/:propertyId",
    verifyToken,
    validate(createPropertyReminder),
    reminderController.createPropertyReminder
);

module.exports = router;
