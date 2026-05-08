import express from "express";
import Hero from "../models/hero.js";
import protectAdmin from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();


// ---------------- GET hero (public) ----------------
router.get("/", async (req, res) => {
console.log("APi hit"); 
 try {
    const hero = await Hero.findOne({});
    res.json(hero);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- SAVE hero (admin) ----------------
router.post(
  "/",
  protectAdmin,
  upload.single("portrait"),
  async (req, res) => {
    try {
      const { name, title, caption, email } = req.body; // 👈 ADD email

      const portrait = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      let hero = await Hero.findOne({});

      if (!hero) {
        hero = new Hero({
          name,
          title,
          caption,
          email,       // 👈 SAVE email
          portrait,
        });
      } else {
        hero.name = name;
        hero.title = title;
        hero.caption = caption;
        hero.email = email;   // 👈 UPDATE email

        if (portrait) {
          hero.portrait = portrait;
        }
      }

      await hero.save();

      res.json({ message: "Hero updated", hero });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
