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

const ACCESS_SECRET = process.env.ACCESS_SECRET || "tutalim-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "tutalim-refresh-secret";
const ACCESS_EXPIRES_MIN = Number(process.env.ACCESS_EXPIRES_MIN || 15);
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 30);

exports.signup = async (req, res) => {
  try {
    const { name, surname, mail, password, role } = req.body;

    const existingUser = await collection.findOne({ mail });
    if (existingUser) {
      return res.json({
        status: "error",
        message: "Bu e-posta zaten kayıtlı.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "fail",
        message: "Şifre en az 8 karakter olmalıdır.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.",
      });
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

    res.json({
      status: "success",
      message: "Kullanıcı oluşturuldu, mail doğrulaması gönderildi.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { mail, password } = req.body;
    const user = await collection.findOne({ mail });

    if (!user)
      return res.json({ status: "fail", message: "Kullanıcı bulunamadı" });

    if (!user.isVerified) {
      return res.json({
        status: "fail",
        message:
          "Hesabınız henüz doğrulanmamış. Lütfen mailinizi kontrol edin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ status: "fail", message: "Yanlış Şifre" });

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
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      })
      .json({ status: "success", token: accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken;
    if (!refreshTokenValue)
      return res
        .status(401)
        .json({ status: "fail", message: "Refresh token eksik" });

    const stored = await RefreshToken.findOne({ token: refreshTokenValue });
    if (!stored || stored.revoked) {
      return res
        .status(401)
        .json({ status: "fail", message: "Refresh token geçersiz" });
    }

    if (stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res
        .status(401)
        .json({ status: "fail", message: "Refresh token süresi dolmuş" });
    }

    const user = await collection.findById(stored.userId);
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });

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
  } catch (err) {
    console.error("Refresh token hatası:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken;
    console.log("Çıkış isteği geldi, cookie:", refreshTokenValue);

    if (!refreshTokenValue) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
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
      console.log(
        "⚠️ DB'de RefreshToken bulunamadı (zaten silinmiş olabilir)."
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });

    return res.json({
      status: "success",
      message: "Başarıyla çıkış yapıldı",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { mail } = req.body;
    const user = await collection.findOne({ mail });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Bu e-posta adresiyle kayıt bulunamadı.",
      });
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
  } catch (err) {
    console.error("Şifre sıfırlama hatası:", err);
    res.status(500).json({
      status: "error",
      message: "Sunucu hatası, lütfen tekrar deneyin.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password: newPassword } = req.body;

    const user = await collection.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Geçersiz veya süresi dolmuş bağlantı.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "fail",
        message: "Şifre en az 8 karakter olmalıdır.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]+$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: "fail",
        message: "Yeni şifre eski şifreyle aynı olamaz.",
      });
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
  } catch (err) {
    console.error("Şifre sıfırlama hatası:", err);
    res.status(500).json({
      status: "error",
      message: "Sunucu hatası, lütfen tekrar deneyin.",
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await collection.findOne({
      verifyToken: token,
      verifyExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Doğrulama bağlantısı geçersiz veya süresi dolmuş.",
      });
    }

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyExpires = null;
    await user.save();

    res.json({
      status: "success",
      message: "Hesabınız başarıyla doğrulandı. Artık giriş yapabilirsiniz.",
    });
  } catch (err) {
    console.error("Doğrulama hatası:", err);
    res.status(500).send("<h3>Sunucu hatası oluştu.</h3>");
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { mail } = req.body;
    const user = await collection.findOne({ mail });
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });
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
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
