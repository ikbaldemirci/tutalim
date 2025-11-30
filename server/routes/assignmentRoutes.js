const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const {
    createAssignment,
    assignmentIdParam,
} = require("../validations/assignmentValidation");

router.post(
    "/",
    verifyToken,
    validate(createAssignment),
    assignmentController.createAssignment
);
router.get("/pending", verifyToken, assignmentController.getPendingAssignments);
router.get("/sent", verifyToken, assignmentController.getSentAssignments);
router.put(
    "/:id/accept",
    verifyToken,
    validate(assignmentIdParam),
    assignmentController.acceptAssignment
);
router.put(
    "/:id/reject",
    verifyToken,
    validate(assignmentIdParam),
    assignmentController.rejectAssignment
);

module.exports = router;
