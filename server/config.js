const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/tutalim")
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Failed to connect to MongoDB"));

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
