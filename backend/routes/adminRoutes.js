import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/admin.js";
import protectAdmin from "../middleware/authMiddleware.js";
import transporter from "../mailer.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const admin = await Admin.findOne({ username: normalizedUsername }).select("+password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, tokenVersion: admin.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin._id, username: admin.username },
      message: "Welcome back!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// CHANGE PASSWORD (while logged in)
router.post("/change-password", protectAdmin, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");

    if (!(await admin.matchPassword(oldPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    admin.password = newPassword;
    admin.tokenVersion += 1;
    await admin.save();

    res.json({ message: "Password updated. Please log in again." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= FORGOT PASSWORD =================
// No email input needed - single-admin system, so we always email the
// fixed recovery address from .env rather than asking "which account"
// (which would let someone probe for valid usernames).
router.post("/forgot-password", async (req, res) => {
  try {
    const admin = await Admin.findOne({});

    const genericResponse = {
      message: "If an admin account exists, a reset link has been sent.",
    };

    if (!admin) {
      return res.json(genericResponse);
    }

    // Recovery address from .env (falls back to the sending Gmail account)
    const recipient = process.env.ADMIN_RECOVERY_EMAIL || process.env.GMAIL_USER;
    if (!recipient) {
      console.error("Forgot password error: no ADMIN_RECOVERY_EMAIL or GMAIL_USER in .env");
      return res.status(500).json({ message: "Reset email is not configured on the server." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await admin.save();

    // The Login page opens the "Set New Password" form when it sees ?reset=
    const frontend = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${frontend}/admin?reset=${rawToken}`;

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: recipient,
        subject: "Admin Password Reset Request",
        html: `
          <h3>Password Reset Requested</h3>
          <p>Click the link below to set a new admin password. This link expires in 15 minutes.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } catch (mailErr) {
      // The real reason (wrong App Password, no recipient, network...) is in the server log
      console.error("Forgot password - email failed:", mailErr.message);
      return res
        .status(500)
        .json({ message: "Could not send the reset email. Please try again later." });
    }

    res.json(genericResponse);
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!admin) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    admin.password = newPassword;
    admin.tokenVersion += 1;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;