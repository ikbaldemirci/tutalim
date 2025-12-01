const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

router.post("/extract-property", upload.single("file"), async (req, res) => {
  try {
    const maxSize = 25 * 1024 * 1024;
    if (req.file.size > maxSize) {
      fs.unlinkSync(req.file.path);
      return res.json({
        status: "error",
        message: "Dosya boyutu 25MB'dan büyük olamaz.",
      });
    }

    const filePath = req.file.path;
    const isPDF = req.file.mimetype === "application/pdf";

    let messageContent;

    if (isPDF) {
      const pdfParse = require("pdf-parse");
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);

      messageContent = [
        {
          type: "text",
          text: `
Bu bir kira sözleşmesi metnidir. Aşağıdaki alanları JSON formatında çıkar:

- tenantName (kiracının adı soyadı)
- rentPrice (kira bedeli, sadece rakam)
- rentDate (başlangıç tarihi, DD.MM.YYYY formatında)
- endDate (bitiş tarihi, DD.MM.YYYY formatında)
- location (konum/adres)

Sadece JSON döndür. Açıklama yazma.

METIN:
${pdfData.text}
          `,
        },
      ];
    } else {
      // Görsel için image_url kullan
      const fileBase64 = fs.readFileSync(filePath, "base64");
      messageContent = [
        {
          type: "image_url",
          image_url: {
            url: `data:${req.file.mimetype};base64,${fileBase64}`,
          },
        },
        {
          type: "text",
          text: `
Bu bir kira sözleşmesi veya kira ekran görüntüsü.
Bu alanları JSON formatında çıkar:

- tenantName (kiracının adı soyadı)
- rentPrice (kira bedeli, sadece rakam)
- rentDate (başlangıç tarihi, DD.MM.YYYY formatında)
- endDate (bitiş tarihi, DD.MM.YYYY formatında)
- location (konum/adres)

Sadece JSON döndür. Açıklama yazma.
          `,
        },
      ];
    }

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    let raw = result.choices[0].message.content;
    console.log("AI RAW RESULT:", raw);

    let cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("CLEANED JSON:", cleaned);

    let fields = {};
    try {
      fields = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      fs.unlinkSync(filePath);
      return res.json({
        status: "error",
        message: "Belge okunamadı: JSON parse edilemedi.",
      });
    }

    fs.unlinkSync(filePath);

    return res.json({ status: "success", fields });
  } catch (err) {
    console.error("AI ERROR:", err);
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.json({ status: "error", message: "Belge okunamadı." });
  }
});

module.exports = router;
