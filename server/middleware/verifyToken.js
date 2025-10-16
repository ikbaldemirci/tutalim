// const jwt = require("jsonwebtoken");

// module.exports = function verifyToken(req, res, next) {
//   try {
//     // 🔹 Önce Authorization header'dan al
//     const authHeader = req.headers.authorization;
//     let token = authHeader && authHeader.split(" ")[1];

//     // 🔹 Eğer yoksa cookie'den al
//     if (!token && req.cookies?.accessToken) {
//       token = req.cookies.accessToken;
//     }

//     if (!token) {
//       return res.status(401).json({
//         status: "fail",
//         message: "Erişim reddedildi. Token bulunamadı.",
//       });
//     }

//     // 🔹 Doğrulama
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error("Token doğrulama hatası:", err);
//     return res.status(401).json({
//       status: "fail",
//       message: "Geçersiz veya süresi dolmuş token.",
//     });
//   }
// };

const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Header yoksa
  if (!authHeader) {
    console.warn("🚫 Authorization header yok");
    return res.status(401).json({ status: "fail", message: "Token gerekli" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("🚫 Token bulunamadı");
    return res
      .status(401)
      .json({ status: "fail", message: "Token bulunamadı" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("⚠️ Token doğrulama hatası:", err.name);
    // Eğer token süresi dolmuşsa veya imza geçersizse
    // refresh endpoint’ine gidişe izin verelim
    if (req.originalUrl.includes("/api/refresh")) {
      console.log("⏳ Refresh isteğine izin veriliyor...");
      return next();
    }

    return res
      .status(401)
      .json({ status: "fail", message: "Token geçersiz veya süresi dolmuş" });
  }
};
