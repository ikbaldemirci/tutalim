const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, reminderController.createReminder);
router.get("/:userId", verifyToken, reminderController.getReminders);
router.put("/:id/complete", verifyToken, reminderController.completeReminder);
router.delete("/:id", verifyToken, reminderController.deleteReminder);
router.post(
    "/property/:propertyId",
    verifyToken,
    reminderController.createPropertyReminder
);

module.exports = router;
