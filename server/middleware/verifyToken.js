const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn("Authorization header yok");
    return res.status(401).json({ status: "fail", message: "Token gerekli" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("Token bulunamadı");
    return res
      .status(401)
      .json({ status: "fail", message: "Token bulunamadı" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token doğrulama hatası:", err.name);
    if (req.originalUrl.includes("/api/refresh")) {
      console.log("Refresh isteğine izin veriliyor...");
      return next();
    }

    return res
      .status(401)
      .json({ status: "fail", message: "Token geçersiz veya süresi dolmuş" });
  }
};
