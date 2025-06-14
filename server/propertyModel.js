const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  rentPrice: { type: Number, required: true },
  rentDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  realtor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
  details: { type: mongoose.Schema.Types.Mixed },
});

module.exports = mongoose.model("properties", PropertySchema);
