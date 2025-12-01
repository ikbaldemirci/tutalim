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

    if (req.file.size > 25 * 1024 * 1024) {
      return res.json({
        status: "error",
        message: "Dosya boyutu 25MB'dan büyük olamaz.",
      });
    }

    const mimetype = req.file.mimetype;
    let messageContent = [];

    if (mimetype === "application/pdf") {
      const pdfParse = require("pdf-parse");
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);

      messageContent = [
        {
          type: "text",
          text: `
Bu bir kira sözleşmesi metnidir.

Aşağıdaki alanları JSON formatında çıkar:

- tenantName
- rentPrice (sadece rakam)
- rentDate (DD.MM.YYYY)
- endDate (DD.MM.YYYY)
- location

METİN:
${pdfData.text}

Sadece JSON döndür. Açıklama yazma.
          `,
        },
      ];
    } else {
      const fileBase64 = fs.readFileSync(filePath, "base64");

      messageContent = [
        {
          type: "image_url",
          image_url: {
            url: `data:${mimetype};base64,${fileBase64}`,
          },
        },
        {
          type: "text",
          text: `
Bu bir kira sözleşmesi görselidir.

Aşağıdaki alanları JSON olarak çıkar:

- tenantName
- rentPrice (sadece rakam)
- rentDate (DD.MM.YYYY)
- endDate (DD.MM.YYYY)
- location

Sadece JSON döndür. Açıklama yazma.
          `,
        },
      ];
    }

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: messageContent }],
    });

    let raw = result.choices[0].message.content;
    console.log("AI RAW:", raw);

    let cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("CLEAN:", cleaned);

    let fields = JSON.parse(cleaned);

    return res.json({ status: "success", fields });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.json({ status: "error", message: "Belge okunamadı." });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

module.exports = router;
