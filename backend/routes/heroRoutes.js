import express from "express";
import Hero from "../models/hero.js";
import protectAdmin from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ---------------- GET hero (public) ----------------
router.get("/", async (req, res) => {
  try {
    const hero = await Hero.findOne({});
    res.json(hero);
  } catch (err) {
    console.error("Fetch hero error:", err);
    res.status(500).json({ message: err.message, error: err.message });
  }
});

// ---------------- SAVE hero (admin) ----------------
// upload.fields() accepts two files at once: the portrait image and the CV.
// Wrapped manually so a rejected file (wrong type, too large) returns clean
// JSON instead of crashing / falling through to Express's default HTML error page.
// Errors are sent as `message` (like the other routes) and `error`
// (kept for older code that reads it).
router.post("/", protectAdmin, (req, res, next) => {
  upload.fields([
    { name: "portrait", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error("Hero upload error:", err.message);
      return res.status(400).json({ message: err.message, error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, title, caption, email } = req.body;

    if (!name || !title || !email) {
      const msg = "Name, title and email are required";
      return res.status(400).json({ message: msg, error: msg });
    }

    // With upload.fields(), files arrive as req.files.<fieldName>[0]
    const portraitFile = req.files?.portrait?.[0];
    const cvFile = req.files?.cv?.[0];

    const portrait = portraitFile ? `/uploads/${portraitFile.filename}` : null;
    const cv = cvFile ? `/uploads/${cvFile.filename}` : null;

    let hero = await Hero.findOne({});

    if (!hero) {
      hero = new Hero({ name, title, caption, email, portrait, cv: cv || "" });
    } else {
      hero.name = name;
      hero.title = title;
      hero.caption = caption;
      hero.email = email;

      if (portrait) {
        hero.portrait = portrait;
      }
      if (cv) {
        hero.cv = cv; // only replaced when a new CV is uploaded
      }
    }

    await hero.save();

    res.json({ message: "Hero updated", hero });
  } catch (err) {
    console.error("Save hero error:", err);
    res.status(500).json({ message: err.message, error: err.message });
  }
});

export default router;