const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const collection = require("./config");
const app = express();
const Property = require("./propertyModel");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const RefreshToken = require("./models/RefreshToken");

const ACCESS_SECRET = process.env.ACCESS_SECRET || "tutalim-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "tutalim-refresh-secret";
const ACCESS_EXPIRES_MIN = Number(process.env.ACCESS_EXPIRES_MIN || 15);
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 30);

const verifyToken = require("./middleware/verifyToken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
    // cb(
    //   null,
    //   file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    // );
  },
});

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: "http://localhost:5173",
    // origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.options("*", cors());
app.use("/uploads", express.static("uploads"));

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  try {
    const { name, surname, mail, password, role } = req.body;
    const existingUser = await collection.findOne({ mail });
    if (existingUser)
      return res.json({ status: "error", message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.create({
      name,
      surname,
      mail,
      password: hashedPassword,
      role,
    });

    res.json({ status: "success", message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

const jwt = require("jsonwebtoken");
// const SECRET_KEY = "tutalim-secret";

// Login endpoint
// app.post("/api/login", async (req, res) => {
//   const { mail, password } = req.body;
//   const user = await collection.findOne({ mail });

//   if (!user) return res.json({ status: "fail", message: "User not found" });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.json({ status: "fail", message: "Wrong password" });

//   const token = jwt.sign(
//     {
//       id: user._id,
//       role: user.role,
//       name: user.name,
//       surname: user.surname,
//       mail: user.mail,
//     },
//     SECRET_KEY,
//     { expiresIn: "1h" }
//   );
//   res.json({ status: "success", token });
// });

app.post("/api/login", async (req, res) => {
  const { mail, password } = req.body;
  const user = await collection.findOne({ mail });

  if (!user) return res.json({ status: "fail", message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ status: "fail", message: "Yanlış Şifre" });

  // 🔹 Access Token (15 dk)
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

  // 🔹 Refresh Token (30 gün)
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
      secure: false, // ⚠️ localde HTTPS olmadığı için false
      sameSite: "Lax", // 🔥 Chrome 2025 için zorunlu tutalim.com
      path: "/", // her endpointte geçerli
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    })
    .json({ status: "success", token: accessToken });
});

// Kullanıcıyı mail ile bul
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

// Create a new property
// app.post("/api/properties", verifyToken, async (req, res) => {
//   try {
//     const {
//       rentPrice,
//       rentDate,
//       endDate,
//       location,
//       realtorId,
//       ownerId,
//       tenantName,
//     } = req.body;

//     if (!rentPrice || !rentDate || !endDate || !location || !realtorId) {
//       return res
//         .status(400)
//         .json({ status: "fail", message: "Eksik alanlar var" });
//     }

//     const property = await Property.create({
//       rentPrice,
//       rentDate: new Date(rentDate),
//       endDate: new Date(endDate),
//       location,
//       realtor: realtorId,
//       owner: ownerId || null,
//       tenantName: tenantName || "",
//     });

//     const populatedProperty = await Property.findById(property._id)
//       .populate("realtor", "name mail")
//       .populate("owner", "name mail");

//     res.json({ status: "success", property: populatedProperty });
//   } catch (err) {
//     console.error("Property ekleme hatası:", err);
//     res.status(500).json({ status: "error", message: "Server error" });
//   }
// });

// ✅ Güvenli: sadece girişli emlakçı ilan ekleyebilir
app.post("/api/properties", verifyToken, async (req, res) => {
  try {
    const { rentPrice, rentDate, endDate, location, tenantName } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 🔒 Sadece emlakçılar mülk ekleyebilir
    if (userRole !== "realtor") {
      return res.status(403).json({
        status: "fail",
        message: "Sadece emlakçılar ilan ekleyebilir.",
      });
    }

    // 🧾 Zorunlu alan kontrolü
    if (!rentPrice || !rentDate || !endDate || !location) {
      return res
        .status(400)
        .json({ status: "fail", message: "Eksik alanlar var" });
    }

    // 🏠 Yeni mülk oluştur
    const property = await Property.create({
      rentPrice,
      rentDate: new Date(rentDate),
      endDate: new Date(endDate),
      location,
      realtor: userId, // ✅ artık token'dan geliyor
      tenantName: tenantName || "",
      owner: null, // ilk başta ev sahibi atanmaz
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

// Get properties filtered by realtor and owner
// ✅ Güvenli hale getirildi — verifyToken eklendi
app.get("/api/properties", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const filter = {};

    // 🔹 Role göre sadece kendi mülklerini getir
    if (userRole === "realtor") {
      filter.realtor = userId;
    } else if (userRole === "owner") {
      filter.owner = userId;
    } else {
      // diğer roller erişemesin
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

// Update a property
// app.put("/api/properties/:id", verifyToken, async (req, res) => {
//   try {
//     const {
//       rentPrice,
//       rentDate,
//       endDate,
//       location,
//       tenantName,
//       ownerId,
//       ownerMail,
//     } = req.body;

//     let updateData = {
//       rentPrice,
//       rentDate: new Date(rentDate),
//       endDate: new Date(endDate),
//       location,
//       tenantName,
//     };

//     // Eğer ownerMail gönderildiyse ev sahibini mail üzerinden bul ve ata
//     if (ownerMail) {
//       const owner = await collection.findOne({ mail: ownerMail });
//       if (!owner) {
//         return res
//           .status(404)
//           .json({ status: "fail", message: "Owner not found" });
//       }
//       updateData.owner = owner._id;
//     }

//     const property = await Property.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )
//       .populate("realtor", "name mail")
//       .populate("owner", "name mail");

//     res.json({ status: "success", property });
//   } catch (err) {
//     console.error("Property update error:", err);
//     res.status(500).json({ status: "error", message: "Server error" });
//   }
// });

// ✅ Güvenli property güncelleme
app.put("/api/properties/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const propertyId = req.params.id;

    const { rentPrice, rentDate, endDate, location, tenantName } = req.body;

    // 🔹 Property'i bul
    const property = await Property.findById(propertyId);

    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    }

    // 🔒 Yetki kontrolü
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

    // 🔹 Güncellemeyi uygula
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

// ✅ Property assign güvenli versiyon
// app.put("/api/properties/:id/assign", verifyToken, async (req, res) => {
//   try {
//     const { ownerMail, realtorMail } = req.body;
//     let updateData = {};

//     // 🔹 Eğer atama iptali geliyorsa (null)
//     if (ownerMail === null) updateData.owner = null;
//     if (realtorMail === null) updateData.realtor = null;

//     // 🔹 Eğer mail adresi geldiyse, kullanıcıyı bul
//     const mail = ownerMail || realtorMail;
//     if (!mail)
//       return res
//         .status(400)
//         .json({ status: "fail", message: "Mail adresi gerekli" });

//     const user = await collection.findOne({ mail });
//     if (!user)
//       return res
//         .status(404)
//         .json({ status: "fail", message: "Kullanıcı bulunamadı" });

//     // 🔹 Rol kontrolü
//     if (ownerMail) {
//       // Emlakçı -> Ev sahibi atayabilir
//       if (user.role !== "owner") {
//         return res.status(400).json({
//           status: "fail",
//           message: "Lütfen bir ev sahibi maili girin.",
//         });
//       }
//       updateData.owner = user._id;
//     }

//     if (realtorMail) {
//       // Ev sahibi -> Emlakçı atayabilir
//       if (user.role !== "realtor") {
//         return res.status(400).json({
//           status: "fail",
//           message: "Lütfen bir emlakçı maili girin.",
//         });
//       }
//       updateData.realtor = user._id;
//     }

//     // 🔹 Güncelleme işlemi
//     const property = await Property.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )
//       .populate("realtor", "name mail")
//       .populate("owner", "name mail");

//     res.json({
//       status: "success",
//       property,
//       message: "Atama işlemi başarılı ✅",
//     });
//   } catch (err) {
//     console.error("Assign error:", err);
//     res.status(500).json({ status: "error", message: "Sunucu hatası oluştu" });
//   }
// });
app.put("/api/properties/:id/assign", verifyToken, async (req, res) => {
  try {
    const { ownerMail, realtorMail } = req.body;
    let updateData = {};

    // 🔹 1) Eğer kaldırma isteği geldiyse (null gönderilmişse)
    if (ownerMail === null) {
      updateData.owner = null;
    }
    if (realtorMail === null) {
      updateData.realtor = null;
    }

    // Eğer null kaldırma dışında bir işlem yoksa (sadece kaldırma yapıldıysa)
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

    // 🔹 2) Eğer mail adresi geldiyse, kullanıcıyı bul
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

    // 🔹 3) Rol kontrolü
    if (ownerMail) {
      // Emlakçı -> Ev sahibi atayabilir
      if (user.role !== "owner") {
        return res.status(400).json({
          status: "fail",
          message: "Lütfen bir ev sahibi maili girin.",
        });
      }
      updateData.owner = user._id;
    }

    if (realtorMail) {
      // Ev sahibi -> Emlakçı atayabilir
      if (user.role !== "realtor") {
        return res.status(400).json({
          status: "fail",
          message: "Lütfen bir emlakçı maili girin.",
        });
      }
      updateData.realtor = user._id;
    }

    // 🔹 4) Güncelleme işlemi (normal atama)
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

// Delete a property
// app.delete("/api/properties/:id", verifyToken, async (req, res) => {
//   try {
//     await Property.findByIdAndDelete(req.params.id);
//     res.json({ status: "success", message: "Property deleted" });
//   } catch (err) {
//     console.error("Property delete error:", err);
//     res.status(500).json({ status: "error", message: "Server error" });
//   }
// });

// ✅ Güvenli mülk silme
app.delete("/api/properties/:id", verifyToken, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 🔹 Property'i bul
    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    }

    // 🔒 Yetki kontrolü
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

    // 🔹 Silme işlemi
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

// Sözleşme yükleme endpointi
// app.post(
//   "/api/properties/:id/contract",
//   verifyToken,
//   upload.single("contract"),
//   async (req, res) => {
//     try {
//       const property = await Property.findByIdAndUpdate(
//         req.params.id,
//         { contractFile: req.file.path }, // dosya yolu kaydedilecek
//         { new: true }
//       )
//         .populate("realtor", "name mail")
//         .populate("owner", "name mail");

//       if (!property) {
//         return res
//           .status(404)
//           .json({ status: "fail", message: "Property not found" });
//       }

//       res.json({
//         status: "success",
//         message: "Sözleşme başarıyla yüklendi",
//         property,
//       });
//     } catch (err) {
//       console.error("Contract upload error:", err);
//       res
//         .status(500)
//         .json({ status: "error", message: "Server error while uploading" });
//     }
//   }
// );

// ✅ Güvenli sözleşme yükleme
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

      // 🔒 Yetki kontrolü
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

      // ✅ Güncelleme
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

// delete contract
// app.delete("/api/properties/:id/contract", verifyToken, async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//       return res
//         .status(404)
//         .json({ status: "fail", message: "Property not found" });
//     }

//     // if (property.contractFile) {
//     //   const filePath = path.resolve(property.contractFile);
//     //   if (fs.existsSync(filePath)) {
//     //     fs.unlinkSync(filePath);
//     //   }
//     //   property.contractFile = "";
//     //   await property.save();
//     // }

//     if (property.contractFile) {
//       // normalize et: başındaki / veya \ varsa kaldır
//       const safePath = property.contractFile.replace(/^[/\\]+/, "");
//       const filePath = path.join(__dirname, safePath);

//       try {
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
//       } catch (fileErr) {
//         console.error("Dosya silme hatası:", fileErr);
//       }

//       property.contractFile = "";
//       await property.save();
//     }

//     const updatedProperty = await Property.findById(req.params.id)
//       .populate("realtor", "name mail")
//       .populate("owner", "name mail");

//     res.json({
//       status: "success",
//       message: "Contract deleted",
//       property: updatedProperty,
//     });
//   } catch (err) {
//     console.error("Delete contract error:", err);
//     res.status(500).json({ status: "error", message: "Server error" });
//   }
// });

// ✅ Güvenli sözleşme silme
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

    // 🔒 Yetki kontrolü
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

    // ✅ Dosya varsa sil
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

// 🔹 Kullanıcı bilgilerini güncelle (ad + soyad) + yeni token üret
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

    // ✅ Yeni JWT oluştur (surname dahil)
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

    // ✅ Güncellenmiş kullanıcı ve token frontend’e gönder
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

// 🔹 Şifre değiştir
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

    // yeni şifre hashle
    const hashedNew = await bcrypt.hash(newPassword, 10);
    user.password = hashedNew;
    await user.save();

    // ✅ yeni token oluştur
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        surname: user.surname, // 👈 burada soyadı da eklendi
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

// 🔹 Access Token Yenileme (Refresh)
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

    // ✅ Yeni access token oluştur
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

    // 🔹 Cookie hiç yoksa bile, kullanıcıya başarılı dönelim
    if (!refreshTokenValue) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false, // prod'da true
        sameSite: "Lax",
        path: "/",
      });
      return res.json({
        status: "success",
        message: "Zaten çıkış yapılmış (cookie yoktu)",
      });
    }

    // 🔹 DB'de token varsa sil, yoksa hata vermeden devam et
    const deleted = await RefreshToken.deleteOne({ token: refreshTokenValue });
    if (deleted.deletedCount > 0) {
      console.log("🗑️ RefreshToken DB'den silindi.");
    } else {
      console.log(
        "⚠️ DB'de RefreshToken bulunamadı (zaten silinmiş olabilir)."
      );
    }

    // 🔹 Tarayıcıdaki cookie’yi kesin olarak temizle
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // localde false, deploy'da true
      sameSite: "Lax",
      path: "/", // aynı path olmalı!
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

app.listen(5000, () => console.log("Server running on port 5000"));
