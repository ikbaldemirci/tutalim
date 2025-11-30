const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  CONTACT_RECEIVER,
} = process.env;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn(
    "UYARI: SMTP konfigürasyonu eksik! Mail gönderimi çalışmayabilir."
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 465),
  secure: String(SMTP_SECURE) === "true",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo = null,
  userId = null,
  propertyId = null,
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Tutalım İletişim" <${SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      replyTo,
      replyTo: replyTo || undefined,
      messageId: `<tutalim-${Date.now()}@${SMTP_HOST}>`,
    });

    setImmediate(async () => {
      try {
        await Notification.create({
          to,
          subject,
          type: detectMailType(subject),
          status: "sent",
          userId,
          propertyId,
        });
      } catch (logErr) {
        console.error("Mail log kaydı başarısız:", logErr.message);
      }
    });

    return info;
  } catch (err) {
    setImmediate(async () => {
      try {
        await Notification.create({
          to,
          subject,
          type: detectMailType(subject),
          status: "failed",
          errorMessage: err.message,
          userId,
          propertyId,
        });
      } catch (logErr) {
        console.error("Hatalı mail log kaydı başarısız:", logErr.message);
      }
    });
    throw err;
  }
}

function detectMailType(subject = "") {
  const s = subject.toLowerCase();
  if (s.includes("davet reddedildi")) return "reject";
  if (s.includes("davet onaylandı")) return "accept";
  if (s.includes("mülk daveti")) return "invite";
  if (s.includes("şifre")) return "reset";
  if (s.includes("doğrula") || s.includes("e-posta")) return "verify";
  return "other";
}

function resetPasswordHtml({ name, link }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <div style="text-align:center;margin-bottom:16px">
        <img src="https://tutalim.com/images/tutalim.webp" alt="Tutalim" style="max-width:160px;height:auto" />
      </div>
      <h2>Şifre Sıfırlama</h2>
      <p>Merhaba ${name || ""},</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu bağlantı <b>15 dakika</b> içinde geçerlidir.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#2563eb;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">
          Şifremi Sıfırla
        </a>
      </p>
      <p>Eğer buton çalışmazsa şu adresi tarayıcıya yapıştırın:</p>
      <p style="word-break:break-all;color:#2563eb">${link}</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <p style="color:#6b7280;font-size:12px">Bu e-postayı siz talep etmediyseniz yok sayabilirsiniz.</p>
    </div>`;
}

function verifyMailHtml({ name, link }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <div style="text-align:center;margin-bottom:16px">
        <img src="https://tutalim.com/images/tutalim.webp" alt="Tutalim" style="max-width:160px;height:auto" />
      </div>
      <h2>Mail Doğrulama</h2>
      <p>Merhaba ${name || ""},</p>
      <p>Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın. Bu bağlantı <b>30 dakika</b> içinde geçerlidir.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#28a745;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">
          Hesabımı Doğrula
        </a>
      </p>
      <p>Eğer buton çalışmazsa şu adresi tarayıcına yapıştır:</p>
      <p style="word-break:break-all;color:#2563eb">${link}</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <p style="color:#6b7280;font-size:12px">Bu e-postayı siz talep etmediyseniz yok sayabilirsiniz.</p>
    </div>`;
}

function assignmentInviteHtml({ fromName, propertyLocation, link }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <div style="text-align:center;margin-bottom:16px">
        <img src="https://tutalim.com/images/tutalim.webp" alt="Tutalim" style="max-width:160px;height:auto" />
      </div>
      <h2>Yeni Mülk Daveti</h2>
      <p>Merhaba,</p>
      <p><strong>${fromName}</strong> sizi <b>${propertyLocation}</b> konumundaki mülke atamak istiyor.</p>
      <p>Lütfen aşağıdaki butona tıklayarak bekleyen davetlerinizi görüntüleyin:</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#2E86C1;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">
          Davetleri Gör
        </a>
      </p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <p style="color:#6b7280;font-size:12px">Bu e-posta otomatik gönderilmiştir, yanıtlamayın.</p>
    </div>`;
}

function assignmentAcceptedHtml({ toName, propertyLocation, link }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <div style="text-align:center;margin-bottom:16px">
        <img src="https://tutalim.com/images/tutalim.webp" alt="Tutalim" style="max-width:160px;height:auto" />
      </div>
      <h2>Davetin Onaylandı</h2>
      <p>Merhaba,</p>
      <p><strong>${toName}</strong> davetinizi onayladı.</p>
      <p>Artık <b>${propertyLocation}</b> konumundaki mülk için gönderdiğiniz davet onaylandı.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#28a745;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">
          Portföyümü Gör
        </a>
      </p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <p style="color:#6b7280;font-size:12px">Bu e-posta otomatik gönderilmiştir, yanıtlamayın.</p>
    </div>`;
}

function assignmentRejectedHtml({ toName, propertyLocation, link }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <div style="text-align:center;margin-bottom:16px">
        <img src="https://tutalim.com/images/tutalim.webp" alt="Tutalim" style="max-width:160px;height:auto" />
      </div>
      <h2>Davet Onaylanmadı</h2>
      <p>Merhaba,</p>
      <p><strong>${toName}</strong> davetinizi onaylamadı.</p>
      <p><b>${
        propertyLocation || ""
      }</b> konumundaki mülk için gönderdiğiniz davet reddedildi.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#dc3545;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">
          Portföyümü Gör
        </a>
      </p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <p style="color:#6b7280;font-size:12px">Bu e-posta otomatik gönderilmiştir, yanıtlamayın.</p>
    </div>`;
}

function reminderMailHtml({ name, message, remindAt }) {
  const formatted = formatTR(remindAt);
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <div style="text-align:center;margin-bottom:16px">
        <img src="https://tutalim.com/images/tutalim.webp" alt="Tutalim" style="max-width:160px;height:auto" />
      </div>
      <h2>Hatırlatıcınız Geldi</h2>
      <p>Merhaba ${name},</p>
      <p>${message}</p>
      <p><b>Tarih:</b> ${formatted}</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <p style="color:#6b7280;font-size:12px">Bu e-posta otomatik gönderilmiştir, yanıtlamayın.</p>
    </div>`;
}

function reminderMailText({ name, message, remindAt }) {
  const formatted = formatTR(remindAt);
  return `Hatırlatıcınız Geldi
Merhaba ${name},

${message}

Tarih: ${formatted}`;
}

function contactMailHtml({ name, email, subject, message }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Yeni İletişim Mesajı</h2>
      <p><b>Ad Soyad:</b> ${name}</p>
      <p><b>E-posta:</b> ${email}</p>
      <p><b>Konu:</b> ${subject || "Belirtilmemiş"}</p>
      <hr />
      <p style="white-space: pre-wrap">${message}</p>
    </div>
  `;
}

module.exports = {
  sendMail,
  resetPasswordHtml,
  verifyMailHtml,
  assignmentInviteHtml,
  assignmentAcceptedHtml,
  assignmentRejectedHtml,
  reminderMailHtml,
  reminderMailText,
  contactMailHtml,
};

function formatTR(dt) {
  try {
    return new Date(dt).toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return String(dt);
  }
}
