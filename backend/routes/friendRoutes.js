import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getFriends,
    getSuggestions,
    sendFriendRequest,
    getReceivedFriendRequests,
    getSentFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    unfriend,
} from "../controllers/friendController.js";

const router = express.Router();

router.get("/", authMiddleware, getFriends);
router.get("/suggestions", authMiddleware, getSuggestions);

router.post("/request", authMiddleware, sendFriendRequest);

router.get("/requests/received", authMiddleware, getReceivedFriendRequests);
router.get("/requests/sent", authMiddleware, getSentFriendRequests);

router.post("/accept", authMiddleware, acceptFriendRequest);
router.post("/reject", authMiddleware, rejectFriendRequest);
router.post("/cancel", authMiddleware, cancelFriendRequest);

router.delete("/unfriend", authMiddleware, unfriend);

export default router;