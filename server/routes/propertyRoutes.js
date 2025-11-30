const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const {
    createProperty,
    updateProperty,
    assignProperty,
    propertyIdParam,
} = require("../validations/propertyValidation");

router.post("/", verifyToken, validate(createProperty), propertyController.createProperty);
router.get("/", verifyToken, propertyController.getProperties);
router.put("/:id", verifyToken, validate(updateProperty), propertyController.updateProperty);
router.put("/:id/assign", verifyToken, validate(assignProperty), propertyController.assignProperty);
router.delete("/:id", verifyToken, validate(propertyIdParam), propertyController.deleteProperty);
router.post(
    "/:id/contract",
    verifyToken,
    upload.single("contract"),
    propertyController.uploadContract
);
router.delete("/:id/contract", verifyToken, validate(propertyIdParam), propertyController.deleteContract);
router.put(
    "/:id/notes",
    verifyToken,
    upload.single("noteImage"),
    propertyController.addNote
);

module.exports = router;
