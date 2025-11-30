const { sendMail, contactMailHtml } = require("../utils/mailer");

exports.sendMail = async (req, res) => {
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

    return res.json({
      status: "success",
      message: "E-posta başarıyla gönderildi",
      messageId: info.messageId,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Mail gönderilemedi",
      error: err.message,
    });
  }
};

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        status: "error",
        message: "Lütfen tüm zorunlu alanları doldurun.",
      });
    }

    await sendMail({
      to: process.env.CONTACT_RECEIVER,
      subject: `Yeni İletişim Mesajı (${subject || "Genel"})`,

      html: contactMailHtml({ name, email, subject, message }),

      replyTo: email,
    });

    return res.json({
      status: "success",
      message: "Mesajınız başarıyla gönderildi.",
    });
  } catch (err) {
    console.error("İletişim formu hatası:", err);
    return res.status(500).json({
      status: "error",
      message: "Sunucu hatası, mesaj gönderilemedi.",
    });
  }
};
