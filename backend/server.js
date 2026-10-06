import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import achievementRoutes from "./routes/achievementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import Admin from "./models/admin.js";
import transporter from "./mailer.js"; // Brevo API wrapper (adjust path if needed)

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------- MIDDLEWARE -----------------
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://187.127.141.6:5173",
    "https://drsrbeenajose.tech",
    "https://www.drsrbeenajose.tech",
  ],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));

// ----------------- RATE LIMITING (brute-force protection on login) -----------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/admin/login", loginLimiter);

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: "Too many reset requests. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/admin/forgot-password", forgotPasswordLimiter);

// ----------------- MONGODB CONNECTION -----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ----------------- ROUTES -----------------
app.use("/api/achievements", achievementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/sections", sectionRoutes); // Position Held, Resource Person, Paper Presentation, Community Engagement, Research Interest

// ----------------- DEFAULT ADMIN (dev only) -----------------
// ⚠️ Only auto-creates a default admin outside production, so a known
// weak password is never (re)created on the live site. Create your real
// admin account once, manually, then this never needs to run in prod.
const createDefaultAdmin = async () => {
  if (process.env.NODE_ENV === "production") return;

  const adminExists = await Admin.findOne({ username: "admin" });
  if (!adminExists) {
    await Admin.create({ username: "admin", password: "principal123" });
    console.log("✅ Dev admin user created (username: admin)");
  } else {
    console.log("ℹ️ Admin already exists");
  }
};
createDefaultAdmin();

// ----------------- EMAIL / CONTACT FORM (Brevo) -----------------
transporter.verify()
  .then(() => console.log("✅ Brevo mail ready"))
  .catch((e) => console.error("❌ Brevo check failed:", e.message));

// Escape user input before inserting into HTML email — prevents HTML/script
// injection in the email body via the contact form.
const escapeHtml = (str = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

app.post("/send-message", async (req, res) => {
  try {
    const { name, email, institution, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const mailOptions = {
      // Brevo sends from your verified sender (MAIL_FROM_EMAIL);
      // replyTo makes "Reply" go to the visitor.
      replyTo: email,
      to: process.env.RECEIVER_EMAIL,
      subject: `Website Message: ${subject}`,
      text: `
New message from portfolio contact form

Name: ${name}
Email: ${email}
Institution: ${institution || "N/A"}

Message:
${message}
      `,
      html: `
        <h3>New message from portfolio contact form</h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Institution:</strong> ${escapeHtml(institution || "N/A")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return res.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// ----------------- ROOT -----------------
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ----------------- START SERVER -----------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on http://0.0.0.0:${PORT}`);
});