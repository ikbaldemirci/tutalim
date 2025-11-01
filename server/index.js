require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const collection = require("./config");
const app = express();
const Property = require("./propertyModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const RefreshToken = require("./models/RefreshToken");
const Assignment = require("./models/Assignment");
const ACCESS_SECRET = process.env.ACCESS_SECRET || "tutalim-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "tutalim-refresh-secret";
const ACCESS_EXPIRES_MIN = Number(process.env.ACCESS_EXPIRES_MIN || 15);
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 30);

const verifyToken = require("./middleware/verifyToken");
const { sendMail, verifyMailHtml } = require("./utils/mailer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads";
    if (req.originalUrl.includes("/contract")) folder = "uploads/contracts";
    else if (req.originalUrl.includes("/note")) folder = "uploads/notes";

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(cookieParser());
app.use(express.json());
app.options("*", cors());
app.use("/uploads", express.static("uploads"));

const allowedOrigins = ["https://tutalim.com", "https://www.tutalim.com"];

app.post("/api/send-mail", async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        status: "error",
        message: "Eksik alanlar var (to, subject, html)",
      });
    }

    const info = await sendMail({
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });

    console.log(`✅ Mail gönderildi: ${info.messageId} -> ${to}`);

    return res.json({
      status: "success",
      message: "E-posta başarıyla gönderildi",
      to,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("❌ Mail gönderme hatası:", err);
    return res.status(500).json({
      status: "error",
      message: "Mail gönderilemedi",
      error: err.message,
    });
  }
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Engellenen origin:", origin);
        callback(new Error("CORS engellendi"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.post("/api/signup", async (req, res) => {
  try {
    const { name, surname, mail, password, role } = req.body;
    const existingUser = await collection.findOne({ mail });
    if (existingUser)
      return res.json({ status: "error", message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(20).toString("hex");
    const verifyExpires = new Date(Date.now() + 30 * 60 * 1000);

    const newUser = await collection.create({
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
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

const jwt = require("jsonwebtoken");

app.post("/api/login", async (req, res) => {
  const { mail, password } = req.body;
  const user = await collection.findOne({ mail });

  if (!user) return res.json({ status: "fail", message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ status: "fail", message: "Yanlış Şifre" });

  if (!user.isVerified) {
    return res.json({
      status: "fail",
      message: "Hesabınız henüz doğrulanmamış. Lütfen mailinizi kontrol edin.",
    });
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
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    })
    .json({ status: "success", token: accessToken });
});

app.get("/api/users", verifyToken, async (req, res) => {
  try {
    const { mail } = req.query;
    if (!mail)
      return res.status(400).json({ status: "fail", message: "Mail gerekli" });

    const user = await collection.findOne({ mail });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });

    res.json({ status: "success", user });
  } catch (err) {
    console.error("Kullanıcı bulma hatası:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
});

app.post("/api/properties", verifyToken, async (req, res) => {
  try {
    const { rentPrice, rentDate, endDate, location, tenantName } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "realtor") {
      return res.status(403).json({
        status: "fail",
        message: "Sadece emlakçılar ilan ekleyebilir.",
      });
    }

    if (!rentPrice || !rentDate || !endDate || !location) {
      return res
        .status(400)
        .json({ status: "fail", message: "Eksik alanlar var" });
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
  } catch (err) {
    console.error("Property ekleme hatası:", err);
    res
      .status(500)
      .json({ status: "error", message: "Sunucu hatası (ilan ekleme)" });
  }
});

app.get("/api/properties", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const filter = {};

    if (userRole === "realtor") {
      filter.realtor = userId;
    } else if (userRole === "owner") {
      filter.owner = userId;
    } else {
      return res
        .status(403)
        .json({ status: "fail", message: "Erişim yetkiniz yok" });
    }

    const properties = await Property.find(filter)
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({ status: "success", properties });
  } catch (err) {
    console.error("Property fetch error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.put("/api/properties/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const propertyId = req.params.id;

    const { rentPrice, rentDate, endDate, location, tenantName } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    }

    if (
      userRole === "realtor" &&
      property.realtor?.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        status: "fail",
        message: "Bu ilana yalnızca kendi ilan sahibi (emlakçı) erişebilir.",
      });
    }

    if (
      userRole === "owner" &&
      property.owner?.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        status: "fail",
        message: "Bu ilana yalnızca kendi sahibi (ev sahibi) erişebilir.",
      });
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
  } catch (err) {
    console.error("Property update error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Sunucu hatası (güncelleme)" });
  }
});

app.put("/api/properties/:id/assign", verifyToken, async (req, res) => {
  try {
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
    if (!mail)
      return res
        .status(400)
        .json({ status: "fail", message: "Mail adresi gerekli" });

    const user = await collection.findOne({ mail });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });

    if (ownerMail) {
      if (user.role !== "owner") {
        return res.status(400).json({
          status: "fail",
          message: "Lütfen bir ev sahibi maili girin.",
        });
      }
      updateData.owner = user._id;
    }

    if (realtorMail) {
      if (user.role !== "realtor") {
        return res.status(400).json({
          status: "fail",
          message: "Lütfen bir emlakçı maili girin.",
        });
      }
      updateData.realtor = user._id;
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({
      status: "success",
      property,
      message: "Atama işlemi başarılı ✅",
    });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası oluştu" });
  }
});

app.delete("/api/properties/:id", verifyToken, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    }

    const isAuthorized =
      (userRole === "realtor" &&
        property.realtor?.toString() === userId.toString()) ||
      (userRole === "owner" &&
        property.owner?.toString() === userId.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        status: "fail",
        message:
          "Bu mülkü silme yetkiniz yok. Sadece kendi mülklerinizi silebilirsiniz.",
      });
    }

    await Property.findByIdAndDelete(propertyId);

    res.json({
      status: "success",
      message: "Mülk başarıyla silindi 🏠",
    });
  } catch (err) {
    console.error("Property delete error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Sunucu hatası (silme işlemi)" });
  }
});

app.post(
  "/api/properties/:id/contract",
  verifyToken,
  upload.single("contract"),
  async (req, res) => {
    try {
      const propertyId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const property = await Property.findById(propertyId);
      if (!property) {
        return res
          .status(404)
          .json({ status: "fail", message: "Mülk bulunamadı" });
      }

      const isAuthorized =
        (userRole === "realtor" &&
          property.realtor?.toString() === userId.toString()) ||
        (userRole === "owner" &&
          property.owner?.toString() === userId.toString());

      if (!isAuthorized) {
        return res.status(403).json({
          status: "fail",
          message:
            "Bu mülke sözleşme yükleme yetkiniz yok. Sadece kendi mülkleriniz için işlem yapabilirsiniz.",
        });
      }

      property.contractFile = req.file.path;
      await property.save();

      const updated = await Property.findById(propertyId)
        .populate("realtor", "name mail")
        .populate("owner", "name mail");

      res.json({
        status: "success",
        message: "Sözleşme başarıyla yüklendi 📄",
        property: updated,
      });
    } catch (err) {
      console.error("Contract upload error:", err);
      res.status(500).json({
        status: "error",
        message: "Sunucu hatası (sözleşme yükleme)",
      });
    }
  }
);

app.delete("/api/properties/:id/contract", verifyToken, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    }

    const isAuthorized =
      (userRole === "realtor" &&
        property.realtor?.toString() === userId.toString()) ||
      (userRole === "owner" &&
        property.owner?.toString() === userId.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        status: "fail",
        message:
          "Bu mülkteki sözleşmeyi silme yetkiniz yok. Sadece kendi mülklerinizin sözleşmesini silebilirsiniz.",
      });
    }

    if (property.contractFile) {
      const safePath = property.contractFile.replace(/^[/\\]+/, "");
      const filePath = path.join(__dirname, safePath);

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
  } catch (err) {
    console.error("Delete contract error:", err);
    res.status(500).json({
      status: "error",
      message: "Sunucu hatası (sözleşme silme)",
    });
  }
});

app.put("/api/users/:id", verifyToken, async (req, res) => {
  try {
    const { name, surname } = req.body;

    const updatedUser = await collection.findByIdAndUpdate(
      req.params.id,
      { name, surname },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });
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
  } catch (err) {
    console.error("Profil güncelleme hatası:", err);
    res.status(500).json({
      status: "error",
      message: "Sunucu hatası, güncelleme başarısız",
    });
  }
});

app.put("/api/users/:id/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await collection.findById(req.params.id);

    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ status: "fail", message: "Mevcut şifre yanlış" });

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
  } catch (err) {
    console.error("Şifre değişim hatası:", err);
    res.status(500).json({
      status: "error",
      message: "Sunucu hatası, şifre değişimi başarısız",
    });
  }
});

app.post("/api/refresh", async (req, res) => {
  console.log("req.cookies:", req.cookies);
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
});

app.post("/api/logout", async (req, res) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken;
    console.log("🚪 Çıkış isteği geldi, cookie:", refreshTokenValue);

    if (!refreshTokenValue) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
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
    console.error("❌ Logout hatası:", err);
    return res.status(500).json({
      status: "error",
      message: "Sunucu hatası, çıkış başarısız",
    });
  }
});

app.put("/api/properties/:id/notes", verifyToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true }
    );
    res.json({ status: "success", property });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Not kaydedilemedi" });
  }
});

app.post("/api/assignments", verifyToken, async (req, res) => {
  try {
    const { propertyId, targetMail, role } = req.body;
    if (!propertyId || !targetMail || !role)
      return res.status(400).json({ status: "fail", message: "Eksik alanlar" });

    if (!["owner", "realtor"].includes(role))
      return res.status(400).json({ status: "fail", message: "Geçersiz rol" });

    const property = await Property.findById(propertyId);
    if (!property)
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    if (role === "owner") {
      if (
        req.user.role !== "realtor" ||
        property.realtor?.toString() !== req.user.id.toString()
      ) {
        return res
          .status(403)
          .json({ status: "fail", message: "Daveti oluşturma yetkiniz yok" });
      }
    } else if (role === "realtor") {
      if (
        req.user.role !== "owner" ||
        property.owner?.toString() !== req.user.id.toString()
      ) {
        return res
          .status(403)
          .json({ status: "fail", message: "Daveti oluşturma yetkiniz yok" });
      }
    }

    const targetUser = await collection.findOne({ mail: targetMail });
    if (!targetUser)
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });

    if (role === "owner" && targetUser.role !== "owner")
      return res
        .status(400)
        .json({ status: "fail", message: "Lütfen bir ev sahibi maili girin." });
    if (role === "realtor" && targetUser.role !== "realtor")
      return res
        .status(400)
        .json({ status: "fail", message: "Lütfen bir emlakçı maili girin." });

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
    res.json({
      status: "success",
      message: "Davet gönderildi. Onay bekleniyor.",
    });
  } catch (err) {
    console.error("Create assignment error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
});

app.get("/api/assignments/pending", verifyToken, async (req, res) => {
  try {
    const list = await Assignment.find({
      toUser: req.user.id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("property", "location rentPrice rentDate endDate")
      .populate("fromUser", "name mail role");
    res.json({ status: "success", assignments: list });
  } catch (err) {
    console.error("List pending assignments error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
});

app.get("/api/assignments/sent", verifyToken, async (req, res) => {
  try {
    const list = await Assignment.find({
      fromUser: req.user.id,
      status: "pending",
    })
      .select("property role toUser status createdAt")
      .populate("property", "location rentPrice rentDate endDate");
    res.json({ status: "success", assignments: list });
  } catch (err) {
    console.error("List sent assignments error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
});

app.post("/api/assignments/:id/accept", verifyToken, async (req, res) => {
  try {
    const invite = await Assignment.findById(req.params.id);
    if (!invite || invite.status !== "pending") {
      return res
        .status(404)
        .json({ status: "fail", message: "Davet bulunamadı" });
    }
    if (invite.toUser.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ status: "fail", message: "Bu daveti kabul etme yetkiniz yok" });
    }

    const property = await Property.findById(invite.property);
    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    }

    if (invite.role === "owner") {
      property.owner = invite.toUser;
    } else if (invite.role === "realtor") {
      property.realtor = invite.toUser;
    }
    await property.save();

    invite.status = "accepted";
    await invite.save();

    const populated = await Property.findById(property._id)
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({
      status: "success",
      message: "Davet kabul edildi.",
      property: populated,
    });
  } catch (err) {
    console.error("Accept assignment error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
});

app.post("/api/assignments/:id/reject", verifyToken, async (req, res) => {
  try {
    const invite = await Assignment.findById(req.params.id);
    if (!invite || invite.status !== "pending") {
      return res
        .status(404)
        .json({ status: "fail", message: "Davet bulunamadı" });
    }
    if (invite.toUser.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ status: "fail", message: "Bu daveti reddetme yetkiniz yok" });
    }
    invite.status = "rejected";
    await invite.save();
    res.json({ status: "success", message: "Davet reddedildi." });
  } catch (err) {
    console.error("Reject assignment error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
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
    const resetExpires = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetExpires = resetExpires;
    await user.save();

    const resetLink = `https://tutalim.com/reset-password/${resetToken}`;

    const { sendMail, resetPasswordHtml } = require("./utils/mailer");
    await sendMail({
      to: mail,
      subject: "Şifre Sıfırlama",
      html: resetPasswordHtml({ name: user.name, link: resetLink }),
      text: `Hesabını doğrulamak için: ${verifyLink}`,
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
});

app.post("/api/reset-password/:token", async (req, res) => {
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
});

app.get("/api/stats", async (req, res) => {
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
});

app.get("/api/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await collection.findOne({
      verifyToken: token,
      verifyExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .send("<h3>Doğrulama bağlantısı geçersiz veya süresi dolmuş.</h3>");
    }

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyExpires = null;
    await user.save();

    res.send(`
      <h2>Hesabınız başarıyla doğrulandı!</h2>
      <p>Artık giriş yapabilirsiniz.</p>
      <a href="https://tutalim.com">Tutalım'a Dön</a>
    `);
  } catch (err) {
    console.error("Doğrulama hatası:", err);
    res.status(500).send("<h3>Sunucu hatası oluştu.</h3>");
  }
});

app.post("/api/verify/resend", async (req, res) => {
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
      subject: "Tutalım — E-posta Doğrulama (Yeniden)",
      html: verifyMailHtml({ name: user.name, link: verifyLink }),
      text: `Doğrulamak için: ${verifyLink}`,
    });

    res.json({
      status: "success",
      message: "Doğrulama e-postası yeniden gönderildi.",
    });
  } catch (err) {
    console.error("resend verify error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
