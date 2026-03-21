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
    video: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;