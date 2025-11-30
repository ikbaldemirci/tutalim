const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const collection = require("../config");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const ACCESS_EXPIRES_MIN = Number(process.env.ACCESS_EXPIRES_MIN);

if (!ACCESS_SECRET) {
  throw new Error("ACCESS_SECRET çevre değişkeni zorunludur (userController)!");
}

exports.getUser = catchAsync(async (req, res, next) => {
  const { mail } = req.query;
  if (!mail) {
    return next(new AppError("Mail gerekli", 400));
  }

  const user = await collection.findOne({ mail });
  if (!user) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }

  res.json({ status: "success", user });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, surname } = req.body;

  const updatedUser = await collection.findByIdAndUpdate(
    req.params.id,
    { name, surname },
    { new: true }
  );

  if (!updatedUser) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }

  const newToken = jwt.sign(
    {
      id: updatedUser._id,
      role: updatedUser.role,
      name: updatedUser.name,
      surname: updatedUser.surname,
      mail: updatedUser.mail,
    },
    ACCESS_SECRET,
    { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
  );

  res.json({
    status: "success",
    message: "Kullanıcı bilgileri güncellendi",
    user: updatedUser,
    token: newToken,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await collection.findById(req.params.id);

  if (!user) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new AppError("Mevcut şifre yanlış", 400));
  }

  const hashedNew = await bcrypt.hash(newPassword, 10);
  user.password = hashedNew;
  await user.save();

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      surname: user.surname,
    },
    ACCESS_SECRET,
    { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
  );

  res.json({
    status: "success",
    message: "Şifre başarıyla değiştirildi",
    token,
  });
});
