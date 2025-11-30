const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const collection = require("../config");
const RefreshToken = require("../models/RefreshToken");
const {
  sendMail,
  verifyMailHtml,
  resetPasswordHtml,
} = require("../utils/mailer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ACCESS_EXPIRES_MIN = Number(process.env.ACCESS_EXPIRES_MIN);
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS);

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "ACCESS_SECRET ve REFRESH_SECRET çevre değişkenleri tanımlanmalıdır!"
  );
}

exports.signup = catchAsync(async (req, res, next) => {
  const { name, surname, mail, password, role } = req.body;

  const existingUser = await collection.findOne({ mail });
  if (existingUser) {
    return next(new AppError("Bu e-posta zaten kayıtlı.", 400));
  }

  if (password.length < 8) {
    return next(new AppError("Şifre en az 8 karakter olmalıdır.", 400));
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]+$/;
  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.",
        400
      )
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomBytes(20).toString("hex");
  const verifyExpires = new Date(Date.now() + 30 * 60 * 1000);

  await collection.create({
    name,
    surname,
    mail,
    password: hashedPassword,
    role,
    verifyToken,
    verifyExpires,
    isVerified: false,
  });

  const verifyLink = `${process.env.PUBLIC_BASE_URL}/verify/${verifyToken}`;
  await sendMail({
    to: mail,
    subject: "Tutalım | Hesabını Doğrula",
    html: verifyMailHtml({ name, link: verifyLink }),
  });

  res.status(201).json({
    status: "success",
    message: "Kullanıcı oluşturuldu, mail doğrulaması gönderildi.",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { mail, password } = req.body;
  const user = await collection.findOne({ mail });

  if (!user) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }

  if (!user.isVerified) {
    return next(
      new AppError(
        "Hesabınız henüz doğrulanmamış. Lütfen mailinizi kontrol edin.",
        401
      )
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Yanlış Şifre", 401));
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      surname: user.surname,
      mail: user.mail,
    },
    ACCESS_SECRET,
    { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
  );

  const refreshTokenValue = uuidv4();
  const refreshExpires = new Date();
  refreshExpires.setDate(refreshExpires.getDate() + REFRESH_EXPIRES_DAYS);

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: refreshExpires,
  });

  res
    .cookie("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "Lax",
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: "/",
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    })
    .json({ status: "success", token: accessToken });
});

exports.refresh = catchAsync(async (req, res, next) => {
  const refreshTokenValue = req.cookies.refreshToken;
  if (!refreshTokenValue) {
    return next(new AppError("Refresh token eksik", 401));
  }

  const stored = await RefreshToken.findOne({ token: refreshTokenValue });
  if (!stored || stored.revoked) {
    return next(new AppError("Refresh token geçersiz", 401));
  }

  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: stored._id });
    return next(new AppError("Refresh token süresi dolmuş", 401));
  }

  const user = await collection.findById(stored.userId);
  if (!user) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }

  const newAccessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      surname: user.surname,
      mail: user.mail,
    },
    ACCESS_SECRET,
    { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
  );

  res.json({ status: "success", token: newAccessToken });
});

exports.logout = catchAsync(async (req, res, next) => {
  const refreshTokenValue = req.cookies.refreshToken;
  console.log("Çıkış isteği geldi, cookie:", refreshTokenValue);

  if (!refreshTokenValue) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAME_SITE || "Lax",
      path: "/",
    });
    return res.json({
      status: "success",
      message: "Zaten çıkış yapılmış (cookie yoktu)",
    });
  }

  const deleted = await RefreshToken.deleteOne({ token: refreshTokenValue });
  if (deleted.deletedCount > 0) {
    console.log("🗑️ RefreshToken DB'den silindi.");
  } else {
    console.log("⚠️ DB'de RefreshToken bulunamadı (zaten silinmiş olabilir).");
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "Lax",
    path: "/",
  });

  return res.json({
    status: "success",
    message: "Başarıyla çıkış yapıldı",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { mail } = req.body;
  const user = await collection.findOne({ mail });
  if (!user) {
    return next(new AppError("Bu e-posta adresiyle kayıt bulunamadı.", 404));
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

  user.resetToken = resetToken;
  user.resetExpires = resetExpires;
  await user.save();

  const resetLink = `https://tutalim.com/reset-password/${resetToken}`;

  await sendMail({
    to: mail,
    subject: "Tutalım | Şifre Sıfırlama",
    html: resetPasswordHtml({ name: user.name, link: resetLink }),
    text: `Hesabını doğrulamak için: ${resetLink}`,
    userId: user._id,
  });

  res.json({
    status: "success",
    message: "Şifre sıfırlama bağlantısı oluşturuldu.",
    link: resetLink,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password: newPassword } = req.body;

  const user = await collection.findOne({
    resetToken: token,
    resetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Geçersiz veya süresi dolmuş bağlantı.", 400));
  }

  if (newPassword.length < 8) {
    return next(new AppError("Şifre en az 8 karakter olmalıdır.", 400));
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]+$/;
  if (!passwordRegex.test(newPassword)) {
    return next(
      new AppError(
        "Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.",
        400
      )
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return next(new AppError("Yeni şifre eski şifreyle aynı olamaz.", 400));
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();

  res.json({
    status: "success",
    message: "Şifreniz başarıyla güncellendi.",
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const user = await collection.findOne({
    verifyToken: token,
    verifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Doğrulama bağlantısı geçersiz veya süresi dolmuş.", 400)
    );
  }

  user.isVerified = true;
  user.verifyToken = null;
  user.verifyExpires = null;
  await user.save();

  res.json({
    status: "success",
    message: "Hesabınız başarıyla doğrulandı. Artık giriş yapabilirsiniz.",
  });
});

exports.resendVerification = catchAsync(async (req, res, next) => {
  const { mail } = req.body;
  const user = await collection.findOne({ mail });
  if (!user) {
    return next(new AppError("Kullanıcı bulunamadı", 404));
  }
  if (user.isVerified) {
    return res.json({
      status: "success",
      message: "Hesap zaten doğrulanmış.",
    });
  }

  const token = crypto.randomBytes(24).toString("hex");
  user.verifyToken = token;
  user.verifyExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const verifyLink = `${process.env.PUBLIC_BASE_URL}/verify/${token}`;
  await sendMail({
    to: user.mail,
    subject: "Tutalım | E-posta Doğrulama (Yeniden)",
    html: verifyMailHtml({ name: user.name, link: verifyLink }),
    text: `Doğrulamak için: ${verifyLink}`,
    userId: user._id,
  });

  res.json({
    status: "success",
    message: "Doğrulama e-postası yeniden gönderildi.",
  });
});
