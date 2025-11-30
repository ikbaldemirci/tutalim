const Notification = require("../models/Notification");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getNotifications = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return next(
      new AppError("Kendi bildirim geçmişinizi görüntüleyebilirsiniz.", 403)
    );
  }

  const list = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({ status: "success", notifications: list });
});
