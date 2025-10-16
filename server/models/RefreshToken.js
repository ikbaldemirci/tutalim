const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    // 👈 eksik alan buydu
    type: String,
    required: true,
    unique: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  // jti: {
  //   type: String,
  //   required: true,
  //   unique: true,
  // },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
