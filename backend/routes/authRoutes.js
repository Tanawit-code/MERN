import express from "express";
import { register, sendEmail, verifyEmail } from "../controllers/authController.js";
<<<<<<< HEAD
import userAuth from '../middleware/authMiddleware.js'
=======
>>>>>>> 8dcc28b3ab0fc7214123df53abac46840d33b729

const router = express.Router();

router.post("/register", register);

router.get("/verify-email", verifyEmail);

router.get("/test-email", async (req, res) => {
  const { email } = req.query;

  await sendEmail(email);

  res.send("Email sent");
});

<<<<<<< HEAD
authRouter.post('/resiter', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/member', userAuth, getMe)

export default authRouter;
=======
export default router;
>>>>>>> 8dcc28b3ab0fc7214123df53abac46840d33b729
