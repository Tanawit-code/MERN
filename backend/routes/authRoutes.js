import express from "express";
import { register, sendEmail, verifyEmail, login, logout, getMe, updateProfile } from "../controllers/authController.js";
import userAuth from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// อัปเดตข้อมูลผู้ใช้ + รูปโปรไฟล์
router.put("/me", userAuth, upload.single("profilePic"), updateProfile);

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.get("/test-email", async (req, res) => {
  const { email } = req.query;
  await sendEmail(email);
  res.send("Email sent");
});
router.post("/login", login);
router.post("/logout", logout);
router.get("/member", userAuth, getMe);

export default router;