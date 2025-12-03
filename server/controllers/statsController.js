const Property = require("../models/Property");
const collection = require("../config");
const catchAsync = require("../utils/catchAsync");

exports.getStats = catchAsync(async (req, res, next) => {
  const propertyCount = await Property.countDocuments();
  const userCount = await collection.countDocuments();
  const matchCount = await Property.countDocuments({
    owner: { $ne: null },
    realtor: { $ne: null },
  });

  res.json({
    status: "success",
    stats: {
      propertyCount,
      userCount,
      matchCount,
    },
  });
});
