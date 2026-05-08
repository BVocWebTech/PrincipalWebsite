import express from "express";
import Achievement from "../models/Achievement.js";
import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();


// =======================================
// GET ALL ACHIEVEMENTS (GROUPED)
// =======================================

router.get("/", async (req, res) => {

  try {

    const achievements = await Achievement
      .find()
      .sort({ category: 1, order: 1 });

    const grouped = {};

    achievements.forEach((item) => {

      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }

      grouped[item.category].push({
        id: item._id,
        title: item.title,
        order: item.order
      });

    });

    res.json(grouped);

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

});


// =======================================
// ADD ACHIEVEMENT
// =======================================

router.post("/", protectAdmin, async (req, res) => {

  try {

    const { category, title, order } = req.body;

    if (!category || !title || order === undefined) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    const achievement = new Achievement({
      category,
      title,
      order
    });

    await achievement.save();

    res.status(201).json({
      message: "Achievement created",
      achievement
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Order already exists in this category"
      });
    }

    res.status(500).json({ message: "Server error" });

  }

});


// =======================================
// UPDATE ACHIEVEMENT
// =======================================

router.put("/:id", protectAdmin, async (req, res) => {

  try {

    const { category, title, order } = req.body;

    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        message: "Achievement not found"
      });
    }

    achievement.category = category;
    achievement.title = title;
    achievement.order = order;

    await achievement.save();

    res.json({
      message: "Updated successfully",
      achievement
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate order in category"
      });
    }

    res.status(500).json({ message: "Server error" });

  }

});


// =======================================
// DRAG & DROP REORDER
// =======================================

router.put("/reorder", protectAdmin, async (req, res) => {

  try {

    const { category, items } = req.body;

    if (!category || !items) {
      return res.status(400).json({
        message: "Invalid data"
      });
    }

    for (let i = 0; i < items.length; i++) {

      await Achievement.findByIdAndUpdate(
        items[i].id,
        { order: i + 1 }
      );

    }

    res.json({
      message: "Order updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});


// =======================================
// DELETE ACHIEVEMENT
// =======================================

router.delete("/:id", protectAdmin, async (req, res) => {

  try {

    const deleted = await Achievement.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    // Fix order after deletion
    const remaining = await Achievement
      .find({ category: deleted.category })
      .sort({ order: 1 });

    for (let i = 0; i < remaining.length; i++) {

      remaining[i].order = i + 1;

      await remaining[i].save();

    }

    res.json({
      message: "Deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});

export default router;