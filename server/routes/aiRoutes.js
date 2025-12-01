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

    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString("base64");

    const messageContent = [
      {
        type: "input_file",
        input_file: {
          mime_type: req.file.mimetype,
          data: base64File,
        },
      },
      {
        type: "text",
        text: `
Bu bir kira sözleşmesi PDF veya görselidir.
Aşağıdaki alanları JSON olarak çıkar:

- tenantName
- rentPrice (sadece rakam)
- rentDate (DD.MM.YYYY formatında)
- endDate (DD.MM.YYYY formatında)
- location

Sadece JSON döndür. Kod bloğu kullanma.
        `,
      },
    ];

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: messageContent }],
    });

    let raw = result.choices[0].message.content;
    console.log("AI RAW RESULT:", raw);

    const cleaned = raw.replace(/```json|```/gi, "").trim();

    const fields = JSON.parse(cleaned);

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
