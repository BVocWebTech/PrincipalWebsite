import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: [
        "position_held",
        "resource_person",
        "paper_presentation",
        "community_engagement",
        "research_interest",
      ],
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    level: { type: String, enum: ["National", "International"] }, // paper_presentation
    status: { type: String, enum: ["Completed", "Active"] }, // community_engagement
    organization: { type: String, trim: true },
    date: { type: Date },
    // community_engagement: full dates are stored, only the year is displayed.
    // endDate is left empty while status is "Active".
    startDate: { type: Date },
    endDate: { type: Date },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model("Section", sectionSchema);