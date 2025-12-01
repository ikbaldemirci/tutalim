const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

router.post("/extract-property", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBase64 = fs.readFileSync(filePath, "base64");

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: `data:${req.file.mimetype};base64,${fileBase64}`,
            },
            {
              type: "text",
              text: `
Bu bir kira sözleşmesi veya kira ekran görüntüsü.
Şu alanları JSON formatında çıkar:

- tenantName
- rentPrice
- rentDate
- endDate
- location

Sadece JSON döndür. Açıklama yazma.
              `,
            },
          ],
        },
      ],
    });

    let fields = {};

    try {
      fields = JSON.parse(result.choices[0].message.content);
    } catch {
      return res.json({
        status: "error",
        message: "Belge okunamadı: JSON parse edilemedi.",
      });
    }

    fs.unlinkSync(filePath);

    return res.json({ status: "success", fields });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.json({ status: "error", message: "Belge okunamadı." });
  }
});

module.exports = router;
