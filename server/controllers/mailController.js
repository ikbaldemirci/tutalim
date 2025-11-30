const { sendMail, contactMailHtml } = require("../utils/mailer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.sendMail = catchAsync(async (req, res, next) => {
  const { to, subject, html, text } = req.body;

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
});

exports.sendContactMail = catchAsync(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  await sendMail({
    to: process.env.CONTACT_RECEIVER,
    from: `Tutalım İletişim <no-reply@tutalim.com>`,
    subject: `Yeni İletişim Talebi (${subject || "Genel"})`,
    html: contactMailHtml({ name, email, subject, message }),
    text: `
Yeni iletişim mesajı

Ad Soyad: ${name}
E-posta: ${email}
Konu: ${subject || "Belirtilmemiş"}
Mesaj:
${message}
      `,
    replyTo: email,
  });

  return res.json({
    status: "success",
    message: "Mesajınız başarıyla gönderildi.",
  });
});
