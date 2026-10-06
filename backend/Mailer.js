import "dotenv/config"; // must be first so .env is loaded

const { BREVO_API_KEY, MAIL_FROM_EMAIL, MAIL_FROM_NAME, ADMIN_RECOVERY_EMAIL } = process.env;

if (!BREVO_API_KEY || !MAIL_FROM_EMAIL) {
  console.warn("Mail setup: BREVO_API_KEY or MAIL_FROM_EMAIL is missing in .env");
}
if (!ADMIN_RECOVERY_EMAIL) {
  console.warn("Mail setup: ADMIN_RECOVERY_EMAIL is missing in .env");
}

// Accepts "a@b.com", ["a@b.com"], or "Name <a@b.com>"
const toList = (to) =>
  (Array.isArray(to) ? to : String(to).split(","))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/<(.+)>/);
      return { email: m ? m[1] : s };
    });

const transporter = {
  // Startup check: confirms the API key works and shows Brevo's reason if not
  async verify() {
    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: { "api-key": (BREVO_API_KEY || "").trim(), accept: "application/json" },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`${res.status}: ${data.message || "no message from Brevo"}`);
    }
    return true;
  },

  // Same shape as nodemailer: sendMail({ to, subject, text, html, replyTo })
  async sendMail({ to, subject, text, html, replyTo }) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": (BREVO_API_KEY || "").trim(),
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: MAIL_FROM_NAME || "Website", email: MAIL_FROM_EMAIL },
        to: toList(to),
        subject,
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
        ...(html ? { htmlContent: html } : {}),
        ...(text ? { textContent: text } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Brevo error ${res.status}`);
    }
    return data; // { messageId: "..." }
  },
};

export default transporter;