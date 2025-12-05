const fs = require("fs");
const path = require("path");
const Property = require("../models/Property");
const Subscription = require("../models/Subscription");
const collection = require("../config");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

function canEditProperty(property, user) {
  const isOwner = property.owner?.toString() === user.id.toString();
  const isRealtor = property.realtor?.toString() === user.id.toString();
  return { isOwner, isRealtor, allowed: isOwner || isRealtor };
}

exports.createProperty = catchAsync(async (req, res, next) => {
  const { rentPrice, rentDate, endDate, location, tenantName } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== "realtor") {
    return next(new AppError("Sadece emlakçılar ilan ekleyebilir.", 403));
  }

  const currentPropertyCount = await Property.countDocuments({
    realtor: userId,
  });

  const FREE_LIMIT = 10;

  if (currentPropertyCount >= FREE_LIMIT) {
    const activeSubscription = await Subscription.findOne({
      userId: userId,
      status: "ACTIVE",
      endDate: { $gt: new Date() },
    });

    if (!activeSubscription) {
      return next(
        new AppError(
          "LIMIT_REACHED: Ücretsiz ilan limitine (10) ulaştınız. Devam etmek için abone olun.",
          403
        )
      );
    }
  }

  if (!rentPrice || !rentDate || !endDate || !location) {
    return next(new AppError("Eksik alanlar var", 400));
  }

  const property = await Property.create({
    rentPrice,
    rentDate: new Date(rentDate),
    endDate: new Date(endDate),
    location,
    realtor: userId,
    tenantName: tenantName || "",
    owner: null,
  });

  const populatedProperty = await Property.findById(property._id)
    .populate("realtor", "name mail")
    .populate("owner", "name mail");

  res.json({
    status: "success",
    message: "Yeni ilan başarıyla eklendi.",
    property: populatedProperty,
  });
});

exports.getProperties = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const filter = {};

  if (userRole === "realtor") {
    filter.realtor = userId;
  } else if (userRole === "owner") {
    filter.owner = userId;
  } else {
    return next(new AppError("Erişim yetkiniz yok", 403));
  }

  const properties = await Property.find(filter)
    .populate("realtor", "name mail")
    .populate("owner", "name mail");

  res.json({ status: "success", properties });
});

exports.updateProperty = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const propertyId = req.params.id;

  const { rentPrice, rentDate, endDate, location, tenantName } = req.body;

  const property = await Property.findById(propertyId);

  if (!property) {
    return next(new AppError("Mülk bulunamadı", 404));
  }

  if (
    userRole === "realtor" &&
    property.realtor?.toString() !== userId.toString()
  ) {
    return next(
      new AppError(
        "Bu ilana yalnızca kendi ilan sahibi (emlakçı) erişebilir.",
        403
      )
    );
  }

  if (
    userRole === "owner" &&
    property.owner?.toString() !== userId.toString()
  ) {
    return next(
      new AppError(
        "Bu ilana yalnızca kendi sahibi (ev sahibi) erişebilir.",
        403
      )
    );
  }

  property.rentPrice = rentPrice ?? property.rentPrice;
  property.rentDate = rentDate ? new Date(rentDate) : property.rentDate;
  property.endDate = endDate ? new Date(endDate) : property.endDate;
  property.location = location ?? property.location;
  property.tenantName = tenantName ?? property.tenantName;

  await property.save();

  const updatedProperty = await Property.findById(property._id)
    .populate("realtor", "name mail")
    .populate("owner", "name mail");

  res.json({
    status: "success",
    message: "Mülk bilgileri başarıyla güncellendi.",
    property: updatedProperty,
  });
});

exports.assignProperty = catchAsync(async (req, res, next) => {
  const { ownerMail, realtorMail } = req.body;
  let updateData = {};

  if (ownerMail === null) {
    updateData.owner = null;
  }
  if (realtorMail === null) {
    updateData.realtor = null;
  }

  if (Object.keys(updateData).length > 0) {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    return res.json({
      status: "success",
      property,
      message: "Atama kaldırıldı ✅",
    });
  }

  const mail = ownerMail || realtorMail;
  if (!mail) {
    return next(new AppError("Mail adresi gerekli", 400));
  }

  const user = await collection.findOne({ mail });
  if (!user) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }

  if (ownerMail) {
    if (user.role !== "owner") {
      return next(new AppError("Lütfen bir ev sahibi maili girin.", 400));
    }
    updateData.owner = user._id;
  }

  if (realtorMail) {
    if (user.role !== "realtor") {
      return next(new AppError("Lütfen bir emlakçı maili girin.", 400));
    }
    updateData.realtor = user._id;
  }

  const property = await Property.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  })
    .populate("realtor", "name mail")
    .populate("owner", "name mail");

  res.json({
    status: "success",
    property,
    message: "Atama işlemi başarılı ✅",
  });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
  const propertyId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError("Mülk bulunamadı", 404));
  }

  const isAuthorized =
    (userRole === "realtor" &&
      property.realtor?.toString() === userId.toString()) ||
    (userRole === "owner" && property.owner?.toString() === userId.toString());

  if (!isAuthorized) {
    return next(
      new AppError(
        "Bu mülkü silme yetkiniz yok. Sadece kendi mülklerinizi silebilirsiniz.",
        403
      )
    );
  }

  await Property.findByIdAndDelete(propertyId);

  res.json({
    status: "success",
    message: "Mülk başarıyla silindi 🏠",
  });
});

exports.uploadContract = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new AppError("Mülk bulunamadı", 404));
  }

  if (!property.realtor) {
    return next(new AppError("Bu işlem için önce bir emlakçı atayın", 400));
  }

  const { allowed } = canEditProperty(property, req.user);
  if (!allowed) {
    return next(new AppError("Bu mülke sözleşme yükleme yetkiniz yok.", 403));
  }

  if (!req.file) {
    return next(new AppError("Lütfen bir sözleşme dosyası seçin.", 400));
  }

  property.contractFile = req.file.path;
  await property.save({ validateBeforeSave: false });

  const updated = await Property.findById(req.params.id)
    .populate("realtor", "name mail")
    .populate("owner", "name mail");

  res.json({
    status: "success",
    message: "Sözleşme başarıyla yüklendi",
    property: updated,
  });
});

exports.deleteContract = catchAsync(async (req, res, next) => {
  const propertyId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError("Mülk bulunamadı", 404));
  }

  const isAuthorized =
    (userRole === "realtor" &&
      property.realtor?.toString() === userId.toString()) ||
    (userRole === "owner" && property.owner?.toString() === userId.toString());

  if (!isAuthorized) {
    return next(
      new AppError(
        "Bu mülkteki sözleşmeyi silme yetkiniz yok. Sadece kendi mülklerinizin sözleşmesini silebilirsiniz.",
        403
      )
    );
  }

  if (property.contractFile) {
    const safePath = property.contractFile.replace(/^[/\\]+/, "");
    const filePath = path.join(__dirname, "..", safePath);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileErr) {
      console.error("Dosya silme hatası:", fileErr);
    }

    property.contractFile = "";
    await property.save();
  }

  const updatedProperty = await Property.findById(propertyId)
    .populate("realtor", "name mail")
    .populate("owner", "name mail");

  res.json({
    status: "success",
    message: "Sözleşme silindi 🗑️",
    property: updatedProperty,
  });
});

exports.addNote = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new AppError("Mülk bulunamadı", 404));
  }

  if (!property.realtor) {
    return next(new AppError("Bu işlem için önce bir emlakçı atayın", 400));
  }

  const { allowed } = canEditProperty(property, req.user);
  if (!allowed) {
    return next(new AppError("Bu mülke not ekleme yetkiniz yok", 403));
  }

  if (typeof req.body?.notes !== "undefined") {
    property.notes = req.body.notes;
  }

  if (req.file) {
    property.notes = property.notes || "";
    property.notes += `<img src="/${req.file.path}" alt="note image" />`;
  }

  await property.save({ validateBeforeSave: false });

  res.json({
    status: "success",
    message: "Not başarıyla kaydedildi",
    property,
  });
});
