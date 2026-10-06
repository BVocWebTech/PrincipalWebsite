import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  portrait: { type: String, required: true },
  caption: { type: String, default: "Visionary Leader" },
  email: { type: String, required: true },
  cv: { type: String, default: "" }, // path to the uploaded CV file, e.g. /uploads/cv-123.pdf
});

export default mongoose.model("Hero", HeroSchema);