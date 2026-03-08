import express from "express";
import { sendEmail, register } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);

router.get("/test-email", async (req, res) => {
  const { email } = req.query;

  await sendEmail(email);

  res.send("Email sent");
});

export default router;