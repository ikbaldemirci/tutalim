const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    type: {
      type: String,
      enum: ["invite", "accept", "reject", "verify", "reset", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "properties",
      default: null,
    },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notifications", NotificationSchema);
