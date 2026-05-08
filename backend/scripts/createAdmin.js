import mongoose from "mongoose";
import Admin from "../models/admin.js";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await Admin.findOne({ username: "admin" });
    if (exists) {
      console.log("❗ Admin already exists");
      process.exit(0);
    }

    await Admin.create({
      username: "admin",
      password: "principal123"
    });

    console.log("✅ Admin created (username: admin, password: principal123)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
