// models/Achievement.js

import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔥 Make order unique per category
AchievementSchema.index({ category: 1, order: 1 }, { unique: true });

export default mongoose.model("Achievement", AchievementSchema);
