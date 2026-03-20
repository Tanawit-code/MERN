import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  verifyOTP: { type: String, default: "" },
  verifyOTPExpire: { type: Number, default: 0 },

  isVerified: { type: Boolean, default: false },
  verificationToken: String,

  resetOTP: { type: String, default: "" },
  resetOTPExpire: { type: Number, default: 0 },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  // รูปโปรไฟล์
  profilePic: { type: String, default: "" }, // จะเก็บ path ของไฟล์ เช่น uploads/profile-xxx.jp

}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;