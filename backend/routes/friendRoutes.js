import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    searchUsers,
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

// ค้นหาผู้ใช้
router.get("/search", authMiddleware, searchUsers);

// รายชื่อเพื่อน / คนแนะนำ
router.get("/", authMiddleware, getFriends);
router.get("/suggestions", authMiddleware, getSuggestions);

// คำขอเป็นเพื่อน
router.post("/request", authMiddleware, sendFriendRequest);
router.get("/requests/received", authMiddleware, getReceivedFriendRequests);
router.get("/requests/sent", authMiddleware, getSentFriendRequests);
router.post("/accept", authMiddleware, acceptFriendRequest);
router.post("/reject", authMiddleware, rejectFriendRequest);
router.post("/cancel", authMiddleware, cancelFriendRequest);

// ลบเพื่อน
router.delete("/unfriend", authMiddleware, unfriend);

export default router;