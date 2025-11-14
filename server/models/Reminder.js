const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "properties",
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: ["manual", "monthlyPayment", "contractEnd"],
      default: "manual",
    },
    message: {
      type: String,
      required: true,
    },
    remindAt: {
      type: Date,
      required: true,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    dayOfMonth: { type: Number, default: null },
    monthsBeforeEnd: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reminders", ReminderSchema);
