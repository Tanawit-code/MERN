// ใช้ map endpoint ฝั่ง auth ไปยัง authController เช่น login, register, verify-email, logout, getMe

import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  updateProfile,
  forgotPassword,
  resetPassword,
  requestAccountChange,
  confirmAccountChange,
} from "../controllers/authController.js";
import userAuth from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/member", userAuth, getMe);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.put("/update-profile", userAuth, upload.single("profilePic"), updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/request-account-change", userAuth, requestAccountChange);
router.get("/confirm-change", confirmAccountChange);

export default router;