const Property = require("../propertyModel");
const collection = require("../config");

exports.getStats = async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Stats endpoint error:", err);
    res
      .status(500)
      .json({ status: "error", message: "İstatistikler alınamadı" });
  }
};
