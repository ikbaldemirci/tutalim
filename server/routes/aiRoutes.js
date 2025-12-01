const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// router.post("/extract-property", upload.single("file"), async (req, res) => {
//   let filePath = null;

//   try {
//     if (!req.file) {
//       return res.json({ status: "error", message: "Dosya yüklenemedi." });
//     }

//     filePath = req.file.path;

//     const maxSize = 25 * 1024 * 1024;
//     if (req.file.size > maxSize) {
//       return res.json({
//         status: "error",
//         message: "Dosya boyutu 25MB'dan büyük olamaz.",
//       });
//     }

//     const fileBase64 = fs.readFileSync(filePath, "base64");

//     const messageContent = [
//       {
//         type: "image_url",
//         image_url: {
//           url: `data:${req.file.mimetype};base64,${fileBase64}`,
//         },
//       },
//       {
//         type: "text",
//         text: `
// Bu bir kira sözleşmesi.
// Aşağıdaki alanları JSON olarak çıkar:

// - tenantName
// - rentPrice (sadece rakam)
// - rentDate (DD.MM.YYYY)
// - endDate (DD.MM.YYYY)
// - location

// Sadece JSON döndür. Açıklama yazma.
//         `,
//       },
//     ];

//     const result = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: messageContent }],
//     });

//     let raw = result.choices[0].message.content;
//     console.log("AI RAW RESULT:", raw);

//     let cleaned = raw
//       .replace(/```json/gi, "")
//       .replace(/```/g, "")
//       .trim();
//     console.log("CLEANED JSON:", cleaned);

//     let fields = JSON.parse(cleaned);

//     return res.json({ status: "success", fields });
//   } catch (err) {
//     console.error("AI ERROR:", err);
//     return res.json({ status: "error", message: "Belge okunamadı." });
//   } finally {
//     if (filePath && fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   }
// });

router.post("/extract-property", upload.single("file"), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.json({ status: "error", message: "Dosya yüklenemedi." });
    }

    filePath = req.file.path;

    const maxSize = 25 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.json({
        status: "error",
        message: "Dosya boyutu 25MB'dan büyük olamaz.",
      });
    }

    const isPDF = req.file.mimetype === "application/pdf";

    let messages;

    if (isPDF) {
      const uploaded = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: "assistants",
      });

      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Bu bir kira sözleşmesi PDF dosyasıdır.
Aşağıdaki alanları JSON formatında çıkar:

- tenantName (kiracının adı soyadı)
- rentPrice (kira bedeli, sadece rakam)
- rentDate (başlangıç tarihi, DD.MM.YYYY formatında)
- endDate (bitiş tarihi, DD.MM.YYYY formatında, yoksa null bırak)
- location (konum/adres)

Sadece JSON döndür. Açıklama yazma.
              `.trim(),
            },
            {
              type: "file",
              file_id: uploaded.id,
            },
          ],
        },
      ];
    } else {
      const fileBase64 = fs.readFileSync(filePath, "base64");

      messages = [
        {
          role: "user",
          content: [
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
Aşağıdaki alanları JSON formatında çıkar:

- tenantName (kiracının adı soyadı)
- rentPrice (kira bedeli, sadece rakam)
- rentDate (başlangıç tarihi, DD.MM.YYYY formatında)
- endDate (bitiş tarihi, DD.MM.YYYY formatında, yoksa null bırak)
- location (konum/adres)

Sadece JSON döndür. Açıklama yazma.
              `.trim(),
            },
          ],
        },
      ];
    }

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    let raw = result.choices[0].message.content;
    console.log("AI RAW RESULT:", raw);

    let cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("CLEANED JSON:", cleaned);

    let fields;
    try {
      fields = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      return res.json({
        status: "error",
        message: "Belge okunamadı: JSON parse edilemedi.",
      });
    }

    return res.json({ status: "success", fields });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.json({ status: "error", message: "Belge okunamadı." });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

module.exports = router;
