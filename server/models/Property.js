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
  tenantName: { type: String, default: "" },

  contractFile: { type: String, default: "" },
  notes: { type: String, default: "" },
});

const Property = mongoose.model("properties", PropertySchema);

module.exports = Property;
