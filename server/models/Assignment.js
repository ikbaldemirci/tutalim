const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "properties", required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    role: { type: String, enum: ["owner", "realtor"], required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled"], default: "pending" },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("assignments", AssignmentSchema);

