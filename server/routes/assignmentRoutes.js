const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, assignmentController.createAssignment);
router.get("/pending", verifyToken, assignmentController.getPendingAssignments);
router.get("/sent", verifyToken, assignmentController.getSentAssignments);
router.post("/:id/accept", verifyToken, assignmentController.acceptAssignment);
router.post("/:id/reject", verifyToken, assignmentController.rejectAssignment);

module.exports = router;
