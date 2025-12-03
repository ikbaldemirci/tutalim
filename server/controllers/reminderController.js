const Reminder = require("../models/Reminder");
const Property = require("../models/Property");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createReminder = catchAsync(async (req, res, next) => {
  const { propertyId, message, remindAt, type, dayOfMonth, monthsBeforeEnd } =
    req.body;

  let finalRemindAt = remindAt ? new Date(remindAt) : null;

  let property = null;
  if (propertyId) {
    property = await Property.findById(propertyId);
    if (!property) {
      return next(new AppError("Mülk bulunamadı.", 400));
    }
  }

  if (type === "monthlyPayment") {
    if (new Date(finalRemindAt) > new Date(property.endDate)) {
      return next(
        new AppError(
          "Sözleşme bitiş tarihinden sonraya hatırlatıcı eklenemez.",
          400
        )
      );
    }

    if (new Date(finalRemindAt) < new Date(property.startDate)) {
      return next(
        new AppError(
          "Sözleşme başlangıç tarihinden önce hatırlatıcı eklenemez.",
          400
        )
      );
    }
  }

  if (type === "contractEnd") {
    finalRemindAt = new Date(remindAt);
  }

  const reminder = await Reminder.create({
    userId: req.user.id,
    propertyId: propertyId || null,
    message,
    remindAt: finalRemindAt,
    type: type || null,
    dayOfMonth: dayOfMonth || null,
    monthsBeforeEnd: monthsBeforeEnd || null,
  });

  return res.json({
    status: "success",
    reminder,
  });
});

exports.getReminders = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return next(new AppError("Bu hatırlatıcıları göremezsiniz.", 403));
  }

  const list = await Reminder.find({ userId })
    .sort({ remindAt: 1 })
    .limit(30)
    .populate("propertyId", "location rentDate endDate");

  res.json({ status: "success", reminders: list });
});

exports.completeReminder = catchAsync(async (req, res, next) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) {
    return next(new AppError("Hatırlatıcı bulunamadı.", 404));
  }

  if (reminder.userId.toString() !== req.user.id.toString()) {
    return next(new AppError("Bu hatırlatıcı size ait değil.", 403));
  }

  reminder.isDone = true;
  await reminder.save();

  res.json({
    status: "success",
    message: "Hatırlatıcı tamamlandı olarak işaretlendi.",
  });
});

exports.deleteReminder = catchAsync(async (req, res, next) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) {
    return next(new AppError("Hatırlatıcı bulunamadı.", 404));
  }

  if (reminder.userId.toString() !== req.user.id.toString()) {
    return next(new AppError("Bu hatırlatıcı size ait değil.", 403));
  }

  await reminder.deleteOne();
  res.json({ status: "success", message: "Hatırlatıcı silindi." });
});

exports.createPropertyReminder = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const { message, type, dayOfMonth, monthsBeforeEnd } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError("Mülk bulunamadı.", 404));
  }

  let remindAt;

  if (type === "monthlyPayment") {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (currentDay < dayOfMonth) {
      remindAt = new Date(currentYear, currentMonth, dayOfMonth, 9, 0, 0);
    } else {
      remindAt = new Date(currentYear, currentMonth + 1, dayOfMonth, 9, 0, 0);
    }
  } else if (type === "contractEnd" && property.endDate) {
    const endDate = new Date(property.endDate);
    remindAt = new Date(endDate);
    remindAt.setMonth(remindAt.getMonth() - monthsBeforeEnd);
    remindAt.setHours(9, 0, 0, 0);
  } else {
    return next(new AppError("Geçersiz reminder tipi veya veri.", 400));
  }

  if (property.endDate) {
    const end = new Date(property.endDate);
    if (remindAt >= end) {
      return next(
        new AppError(
          "Bu sözleşme için hatırlatıcı oluşturulamaz. Sözleşme süresi dolmuş.",
          400
        )
      );
    }
  }

  const reminder = await Reminder.create({
    userId: req.user.id,
    propertyId,
    message: message || "Mülk hatırlatıcısı",
    type,
    dayOfMonth: dayOfMonth || null,
    monthsBeforeEnd: monthsBeforeEnd || null,
    remindAt,
  });

  res.json({ status: "success", reminder });
});
