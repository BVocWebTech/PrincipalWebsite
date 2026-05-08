import mongoose from "mongoose";
import { Caption } from "react-day-picker";

const HeroSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  portrait: { type: String, required: true },
  caption: { type: String, default: "Visionary Leader"},
  email: { type: String, required: true },
});

export default mongoose.model("Hero", HeroSchema);

