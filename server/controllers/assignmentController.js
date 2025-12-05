const Assignment = require("../models/Assignment");
const Property = require("../models/Property");
const Subscription = require("../models/Subscription");
const collection = require("../config");
const {
  sendMail,
  assignmentInviteHtml,
  assignmentAcceptedHtml,
  assignmentRejectedHtml,
} = require("../utils/mailer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createAssignment = catchAsync(async (req, res, next) => {
  const { propertyId, targetMail, role } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError("Mülk bulunamadı", 404));
  }

  if (role === "owner") {
    if (
      req.user.role !== "realtor" ||
      property.realtor?.toString() !== req.user.id.toString()
    ) {
      return next(new AppError("Daveti oluşturma yetkiniz yok", 403));
    }
  } else if (role === "realtor") {
    if (
      req.user.role !== "owner" ||
      property.owner?.toString() !== req.user.id.toString()
    ) {
      return next(new AppError("Daveti oluşturma yetkiniz yok", 403));
    }
  }

  const targetUser = await collection.findOne({ mail: targetMail });
  if (!targetUser) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }

  if (role === "owner" && targetUser.role !== "owner") {
    return next(new AppError("Lütfen bir ev sahibi maili girin.", 400));
  }
  if (role === "realtor" && targetUser.role !== "realtor") {
    return next(new AppError("Lütfen bir emlakçı maili girin.", 400));
  }

  const existing = await Assignment.findOne({
    property: propertyId,
    role,
    status: "pending",
  });
  if (existing) {
    return res.json({
      status: "success",
      message: "Zaten bekleyen bir davet mevcut.",
    });
  }

  await Assignment.create({
    property: propertyId,
    fromUser: req.user.id,
    toUser: targetUser._id,
    role,
    status: "pending",
  });

  await sendMail({
    to: targetUser.mail,
    subject: "Tutalım | Yeni Mülk Daveti",
    html: assignmentInviteHtml({
      fromName: `${req.user.name} ${req.user.surname}`,
      propertyLocation: property.location,
      link: `${process.env.PUBLIC_BASE_URL}/owner`,
    }),
    userId: targetUser._id,
    propertyId: property._id,
  });

  res.json({
    status: "success",
    message: "Davet gönderildi. Onay bekleniyor.",
  });
});

exports.getPendingAssignments = catchAsync(async (req, res, next) => {
  const list = await Assignment.find({
    toUser: req.user.id,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .populate("property", "location rentPrice rentDate endDate")
    .populate("fromUser", "name mail role");
  res.json({ status: "success", assignments: list });
});

exports.getSentAssignments = catchAsync(async (req, res, next) => {
  const list = await Assignment.find({
    fromUser: req.user.id,
    status: "pending",
  })
    .select("property role toUser status createdAt")
    .populate("property", "location rentPrice rentDate endDate");
  res.json({ status: "success", assignments: list });
});

exports.acceptAssignment = catchAsync(async (req, res, next) => {
  const invite = await Assignment.findById(req.params.id);
  if (!invite || invite.status !== "pending") {
    return next(new AppError("Davet bulunamadı", 404));
  }
  if (invite.toUser.toString() !== req.user.id.toString()) {
    return next(new AppError("Bu daveti kabul etme yetkiniz yok", 403));
  }

  // LIMIT CHECK START
  const roleField = invite.role === "owner" ? "owner" : "realtor";
  // Kullanıcının mevcut mülk sayısı
  const currentCount = await Property.countDocuments({ [roleField]: req.user.id });

  if (currentCount >= 10) {
    const hasSubscription = await Subscription.findOne({
      userId: req.user.id,
      status: "ACTIVE",
      endDate: { $gt: new Date() },
    });

    if (!hasSubscription) {
      return next(new AppError("LIMIT_REACHED: Yönetim kotanız doldu (10 Mülk). Lütfen abone olun.", 403));
    }
  }
  // LIMIT CHECK END

  const property = await Property.findById(invite.property);
  if (!property) {
    return next(new AppError("Mülk bulunamadı", 404));
  }

  if (invite.role === "owner") {
    property.owner = invite.toUser;
  } else if (invite.role === "realtor") {
    property.realtor = invite.toUser;
  }
  await property.save();

  invite.status = "accepted";
  await invite.save();

  const fromUser = await collection.findById(invite.fromUser);

  await sendMail({
    to: fromUser.mail,
    subject: "Tutalım | Davet Onaylandı",
    html: assignmentAcceptedHtml({
      toName: `${req.user.name} ${req.user.surname}`,
      propertyLocation: property.location,
      link: `${process.env.PUBLIC_BASE_URL}/realtor`,
    }),
    userId: fromUser._id,
    propertyId: property._id,
  });

  const populated = await Property.findById(property._id)
    .populate("realtor", "name mail")
    .populate("owner", "name mail");

  res.json({
    status: "success",
    message: "Davet kabul edildi.",
    property: populated,
  });
});

exports.rejectAssignment = catchAsync(async (req, res, next) => {
  const invite = await Assignment.findById(req.params.id);
  if (!invite || invite.status !== "pending") {
    return next(new AppError("Davet bulunamadı", 404));
  }
  if (invite.toUser.toString() !== req.user.id.toString()) {
    return next(new AppError("Bu daveti reddetme yetkiniz yok", 403));
  }
  invite.status = "rejected";
  await invite.save();

  const property = await Property.findById(invite.property);
  const fromUser = await collection.findById(invite.fromUser);

  if (fromUser?.mail) {
    await sendMail({
      to: fromUser.mail,
      subject: "Tutalım | Davet Reddedildi",
      html: assignmentRejectedHtml({
        toName: `${req.user.name} ${req.user.surname}`,
        propertyLocation: property ? property.location : "",
        link: `${process.env.PUBLIC_BASE_URL}/realtor`,
      }),
      userId: fromUser._id,
      propertyId: property._id,
    });
  }
  res.json({ status: "success", message: "Davet reddedildi." });
});
