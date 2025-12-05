const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");
const { fromPath } = require("pdf2pic");
const { protect } = require("../middleware/authMiddleware");
const Subscription = require("../models/Subscription");

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

router.post(
  "/extract-property",
  protect,
  upload.single("file"),
  async (req, res) => {
    const activeSubscription = await Subscription.findOne({
      userId: req.user._id,
      status: "ACTIVE",
      endDate: { $gt: new Date() },
    });

    if (!activeSubscription) {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path); // Yüklenen dosyayı sil
      return res
        .status(403)
        .json({
          status: "error",
          message: "Bu özellik sadece aboneler içindir.",
        });
    }

    let filePath = null;

    try {
      if (!req.file) {
        return res.json({ status: "error", message: "Dosya yüklenemedi." });
      }

      filePath = req.file.path;

      const isPDF = req.file.mimetype === "application/pdf";

      let imageBase64 = null;

      if (isPDF) {
        const converter = fromPath(filePath, {
          density: 150,
          saveFilename: "page",
          savePath: "/tmp",
          format: "jpg",
          width: 1200,
          height: 1600,
        });

        const result = await converter(1);
        const jpgPath = result.path;

        imageBase64 = fs.readFileSync(jpgPath, "base64");

        if (fs.existsSync(jpgPath)) fs.unlinkSync(jpgPath);
      } else {
        imageBase64 = fs.readFileSync(filePath, "base64");
      }

      const messages = [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: `
Bu bir kira sözleşmesi görüntüsüdür.
Aşağıdaki alanları JSON olarak çıkar:

- tenantName
- rentPrice (sadece rakam)
- rentDate (DD.MM.YYYY)
- endDate (DD.MM.YYYY)
- location

Sadece JSON döndür, açıklama yazma.
              `,
            },
          ],
        },
      ];

      const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      let raw = result.choices[0].message.content;
      console.log("AI RAW:", raw);

      let cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let fields = JSON.parse(cleaned);

      return res.json({ status: "success", fields });
    } catch (err) {
      console.error("AI ERROR:", err);
      return res.json({ status: "error", message: "Belge okunamadı." });
    } finally {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
);

module.exports = router;
