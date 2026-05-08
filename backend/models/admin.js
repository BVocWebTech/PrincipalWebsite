import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// --- HASH PASSWORD BEFORE SAVE ---
adminSchema.pre("save", async function () {
  // Only run this if password was actually modified
  if (!this.isModified("password")) return;

  // No 'next' needed here because the function is 'async'
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Mongoose will automatically proceed once this function finishes
});

// Compare method
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;