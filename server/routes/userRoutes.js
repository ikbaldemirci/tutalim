const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, userController.getUser);
router.put("/:id", verifyToken, userController.updateUser);
router.put("/:id/password", verifyToken, userController.updatePassword);

module.exports = router;
