import mongoose from "mongoose";

const publicationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "Journal",
        "Full paper in proceedings",
        "Book",
        "Article",
        "Book Chapter",
        "Others",
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["International", "National", "State", "Local"],
      default: "International",
    },
    indexing: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Future date not allowed",
      },
    },
  },
  { timestamps: true }
);

// Prevent exact duplicates
publicationSchema.index(
  { type: 1, title: 1, name: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Publication", publicationSchema);