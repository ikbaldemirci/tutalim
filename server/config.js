const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

const LoginSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    mail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["realtor", "owner"] },
    resetToken: { type: String, default: null },
    resetExpires: { type: Date, default: null },
    verifyToken: { type: String, index: true, default: null },
    verifyExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    iyzicoCustomerReferenceCode: { type: String, default: null },
    iyzicoCardUserKey: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", LoginSchema);
