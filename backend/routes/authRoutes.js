import express from "express";
import { register, sendEmail, verifyEmail, login, logout, getMe } from "../controllers/authController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();

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