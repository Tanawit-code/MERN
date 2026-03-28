// เก็บ schema ของผู้ใช้ เช่น: name email password isVerified
// token สำหรับ verify email / reset password
// profilePic
// video

// ไฟล์นี้คือโครงสร้างข้อมูล user ใน MongoDB

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: "",
    },
    verificationTokenExpire: {
      type: Number,
      default: 0,
    },

    resetOTP: {
      type: String,
      default: "",
    },
    resetOTPExpire: {
      type: Number,
      default: 0,
    },

    profilePic: {
      type: String,
      default: "",
    },
    coverPic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    video: {
      type: String,
      default: "",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    pendingEmail: { type: String, default: "" },
    pendingPassword: { type: String, default: "" },
    changeVerifyToken: { type: String, default: "" },
    changeVerifyExpire: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;