const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");

router.post("/", verifyToken, propertyController.createProperty);
router.get("/", verifyToken, propertyController.getProperties);
router.put("/:id", verifyToken, propertyController.updateProperty);
router.put("/:id/assign", verifyToken, propertyController.assignProperty);
router.delete("/:id", verifyToken, propertyController.deleteProperty);
router.post(
    "/:id/contract",
    verifyToken,
    upload.single("contract"),
    propertyController.uploadContract
);
router.delete("/:id/contract", verifyToken, propertyController.deleteContract);
router.put(
    "/:id/notes",
    verifyToken,
    upload.single("noteImage"),
    propertyController.addNote
);

module.exports = router;
