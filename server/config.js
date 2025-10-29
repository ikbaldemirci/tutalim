const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

const LoginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  mail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["realtor", "owner"] },
  resetToken: { type: String, default: null },
  resetExpires: { type: Date, default: null },
});

module.exports = mongoose.model("users", LoginSchema);
