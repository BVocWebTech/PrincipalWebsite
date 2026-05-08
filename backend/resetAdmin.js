import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/admin.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    const admin = await Admin.findOne({ username: "admin" });

    if (!admin) {
      console.log("No admin found, creating new one...");
      await Admin.create({ username: "admin", password: "principal123" });
      console.log("✅ Admin created with password: principal123");
    } else {
      admin.password = "principal123"; // pre-save hook will hash it
      await admin.save();
      console.log("✅ Admin password reset to: principal123");
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
