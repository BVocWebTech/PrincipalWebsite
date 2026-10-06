import express from "express";
import mongoose from "mongoose";
import Section from "../models/Section.js";
import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Fields each section is allowed to store
const SECTION_FIELDS = {
  paper_presentation: ["title", "level", "organization", "date", "order"],
  community_engagement: ["title", "description", "status", "startDate", "endDate", "order"],
  research_interest: ["title", "description"],
  position_held: ["title", "description", "organization", "startDate", "endDate", "order"],
  resource_person: ["title", "description", "organization", "date", "order"],
};

// Fields that must be present in addition to `title`
const REQUIRED = {
  paper_presentation: ["level"],
  community_engagement: ["status", "startDate"],
  position_held: ["startDate"],
};

// Community engagement has two statuses: Completed and Active (still running)
const isOngoing = (status) => status === "Active";

// Community engagement date rules:
//  - Active    -> no end date (shown as "startYear-Present")
//  - Completed -> end date required (shown as "startYear-endYear")
// Returns an error message, or null if valid. Mutates nothing.
const checkDates = ({ status, startDate, endDate }) => {
  if (status === "Completed" && !endDate) {
    return "End date is required for completed entries";
  }
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return "End date cannot be before start date";
  }
  return null;
};

// Position held: end date is optional (empty = still held), but cannot be before start
const checkRange = ({ startDate, endDate }) => {
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return "End date cannot be before start date";
  }
  return null;
};

// Every stored date must be a real date between 1900 and 2100
const DATE_FIELDS = ["date", "startDate", "endDate"];
const checkDateValues = (obj) => {
  for (const key of DATE_FIELDS) {
    if (obj[key] === undefined) continue;
    const d = new Date(obj[key]);
    const year = d.getUTCFullYear();
    if (Number.isNaN(d.getTime()) || year < 1900 || year > 2100) {
      return `Invalid ${key}`;
    }
  }
  return null;
};

// GET /api/sections/:section -> public, entries for one section
router.get("/:section", async (req, res) => {
  try {
    const { section } = req.params;

    if (!SECTION_FIELDS[section]) {
      return res.status(400).json({ message: "Invalid section" });
    }

    const items = await Section.find({ section }).sort({
      order: 1,
      createdAt: 1,
    });

    res.json(items);
  } catch (err) {
    console.error("Fetch sections error:", err);
    res.status(500).json({ message: "Failed to fetch section" });
  }
});

// POST /api/sections -> admin only, create a new entry
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { section } = req.body;
    const allowed = SECTION_FIELDS[section];

    if (!allowed) {
      return res.status(400).json({ message: "Invalid section" });
    }

    // Keep only the fields this section may store
    const data = { section };
    for (const key of allowed) {
      const value = req.body[key];
      if (value !== undefined && value !== null && value !== "") {
        data[key] = typeof value === "string" ? value.trim() : value;
      }
    }

    // Check required fields
    const missing = ["title", ...(REQUIRED[section] || [])].filter(
      (key) => !data[key]
    );
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required field(s): ${missing.join(", ")}` });
    }

    const badDate = checkDateValues(data);
    if (badDate) return res.status(400).json({ message: badDate });

    if (section === "community_engagement") {
      // Active entries never store an end date
      if (isOngoing(data.status)) delete data.endDate;
      const dateError = checkDates(data);
      if (dateError) return res.status(400).json({ message: dateError });
    }

    if (section === "position_held") {
      const rangeError = checkRange(data);
      if (rangeError) return res.status(400).json({ message: rangeError });
    }

    const entry = await Section.create(data);
    res.status(201).json(entry);
  } catch (err) {
    console.error("Create entry error:", err);

    // Schema validation errors (bad enum value, invalid date, etc.)
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid data submitted" });
    }
    res.status(500).json({ message: "Failed to create entry" });
  }
});

// PUT /api/sections/:id -> admin only, update an entry
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const existing = await Section.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // Section can't be changed; use the fields allowed for the stored section
    const allowed = SECTION_FIELDS[existing.section];
    if (!allowed) {
      return res.status(400).json({ message: "Invalid section" });
    }

    const mustHave = ["title", ...(REQUIRED[existing.section] || [])];
    const $set = {};
    const $unset = {};

    for (const key of allowed) {
      if (!(key in req.body)) continue;

      let value = req.body[key];
      if (typeof value === "string") value = value.trim();
      const isEmpty = value === undefined || value === null || value === "";

      if (isEmpty) {
        if (mustHave.includes(key)) {
          return res.status(400).json({ message: `${key} cannot be empty` });
        }
        $unset[key] = "";
      } else {
        $set[key] = value;
      }
    }

    const badDate = checkDateValues($set);
    if (badDate) return res.status(400).json({ message: badDate });

    if (existing.section === "community_engagement") {
      // Work out what the entry will look like after this update
      const merged = {
        status: existing.status,
        startDate: existing.startDate,
        endDate: existing.endDate,
      };
      for (const key of Object.keys(merged)) {
        if (key in $set) merged[key] = $set[key];
        if (key in $unset) merged[key] = undefined;
      }

      // Active entries never keep an end date
      if (isOngoing(merged.status) && merged.endDate != null) {
        delete $set.endDate;
        $unset.endDate = "";
        merged.endDate = undefined;
      }

      const dateError = checkDates(merged);
      if (dateError) return res.status(400).json({ message: dateError });
    }

    if (existing.section === "position_held") {
      const merged = { startDate: existing.startDate, endDate: existing.endDate };
      for (const key of Object.keys(merged)) {
        if (key in $set) merged[key] = $set[key];
        if (key in $unset) merged[key] = undefined;
      }
      const rangeError = checkRange(merged);
      if (rangeError) return res.status(400).json({ message: rangeError });
    }

    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "No changes provided" });
    }

    const updated = await Section.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("Update entry error:", err);

    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: "Invalid data submitted" });
    }
    res.status(500).json({ message: "Failed to update entry" });
  }
});

// DELETE /api/sections/:id -> admin only
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Invalid id" });
    }

    let deleted = false;

    if (mongoose.isValidObjectId(id)) {
      deleted = !!(await Section.findByIdAndDelete(id));
    }

    // Legacy documents may have a plain string _id (e.g. from a seed script).
    // Mongoose would refuse to cast it, so delete through the raw collection.
    if (!deleted) {
      const result = await Section.collection.deleteOne({ _id: id });
      deleted = result.deletedCount > 0;
    }

    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete entry error:", err);
    res.status(500).json({ message: "Failed to delete entry" });
  }
});

export default router;