const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const verifyToken = require("../middleware/verifyToken");

// Abonelik başlatma (Giriş yapmış kullanıcı)
router.post("/subscribe", verifyToken, paymentController.initializeSubscription);

// Abonelik durumunu sorgulama
router.get("/status", verifyToken, paymentController.getSubscriptionStatus);

// Planları listeleme
router.get("/plans", paymentController.getPlans);

// Iyzico Callback (Giriş yapmasına gerek yok, Iyzico çağırır)
router.post("/callback", paymentController.handleCallback);

module.exports = router;
