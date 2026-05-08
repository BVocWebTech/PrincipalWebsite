import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import achievementRoutes from "./routes/achievementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import Admin from "./models/admin.js";
 // you will create this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
app.use(cors({
 origin: [
 "http://localhost:3000",  
 "http://187.127.141.6:5173",
 "https://drsrbeenajose.tech"
 ]
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));



// ----------------- MONGODB CONNECTION -----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ----------------- ROUTES -----------------
app.use("/api/achievements", achievementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hero", heroRoutes); // save/load hero info
app.use("/api/research", researchRoutes);


const createDefaultAdmin = async () => {
  const adminExists = await Admin.findOne({ username: "admin" });
  if (!adminExists) {
    await Admin.create({ username: "admin", password: "principal123" });
    console.log("✅ Admin user created with password: principal123");
  } else {
    console.log("ℹ️ Admin already exists");
  }
};
createDefaultAdmin();


// ----------------- EMAIL / CONTACT FORM -----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("Error configuring mail transporter:", err);
  } else {
    console.log("Mail transporter is ready");
  }
});

app.post("/send-message", async (req, res) => {
  try {
    const { name, email, institution, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const mailOptions = {
      from: `${name} <${process.env.GMAIL_USER}>`,
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
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Institution:</strong> ${institution || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
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
