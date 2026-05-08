import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find admin and EXPLICITLY select the password & tokenVersion
    const admin = await Admin.findOne({ username }).select("+password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare the plain text password with the hashed version in DB
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Create the "Session" (JWT Payload)
    // We include tokenVersion so the middleware can verify if the session is still valid
    const token = jwt.sign(
      { 
        id: admin._id, 
        tokenVersion: admin.tokenVersion 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Session lasts for 24 hours
    );

    // 4. Send the session token to the frontend
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
      message: "Welcome back!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// CHANGE PASSWORD
router.post("/change-password", protectAdmin, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // select("+password") is required to check oldPassword
    const admin = await Admin.findById(req.admin._id).select("+password");

    if (!(await admin.matchPassword(oldPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    admin.password = newPassword;
    admin.tokenVersion += 1; // This kills all old sessions
    await admin.save();

    res.json({ message: "Password updated. Please log in again." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;