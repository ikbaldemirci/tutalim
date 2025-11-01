const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } =
  process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 465),
  secure: String(SMTP_SECURE) === "true",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
  console.log("E-posta gönderildi:", info.messageId);
  return info;
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

module.exports = { sendMail, resetPasswordHtml, verifyMailHtml };
