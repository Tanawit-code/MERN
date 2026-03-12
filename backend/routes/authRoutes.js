import express from "express";
import { register, sendEmail, verifyEmail } from "../controllers/authController.js";
import userAuth from '../middleware/authMiddleware.js'

const router = express.Router();

router.post("/register", register);

router.get("/verify-email", verifyEmail);

router.get("/test-email", async (req, res) => {
  const { email } = req.query;

  await sendEmail(email);

  res.send("Email sent");
});

authRouter.post('/resiter', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/member', userAuth, getMe)

export default authRouter;