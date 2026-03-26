import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getMyProfile,
    getUserProfile,
    toggleFollow,
    getSuggestedUsers,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.get("/suggestions", authMiddleware, getSuggestedUsers);
router.get("/:userId", authMiddleware, getUserProfile);
router.post("/follow/:userId", authMiddleware, toggleFollow);

export default router;