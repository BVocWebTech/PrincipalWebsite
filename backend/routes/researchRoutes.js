import express from "express";
import Publication from "../models/Research.js";
import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();


// ================= GET (Pagination) =================
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const total = await Publication.countDocuments();

    const publications = await Publication.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      publications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= BULK INSERT =================
router.post("/", protectAdmin, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Invalid format" });
    }

    await Publication.insertMany(req.body);

    res.status(201).json({ message: "Saved successfully" });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate entry detected" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= UPDATE =================
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const updated = await Publication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Updated successfully", updated });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= DELETE =================
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const deleted = await Publication.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;