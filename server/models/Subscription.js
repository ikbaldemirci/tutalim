const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        planType: {
            type: String,
            enum: ["1_MONTH", "2_MONTHS", "6_MONTHS", "12_MONTHS"],
            required: true,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED", "PENDING", "CANCELLED"],
            default: "PENDING",
        },
        iyzicoSubscriptionReferenceCode: {
            type: String,
            // Iyzico'dan dönen abonelik referans kodu
        },
        iyzicoParentReferenceCode: {
            type: String,
            // Iyzico müşteri referans kodu (opsiyonel, gerekirse)
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
