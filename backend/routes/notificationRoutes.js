import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadNotificationCount);
router.post("/read", authMiddleware, markNotificationAsRead);
router.post("/read-all", authMiddleware, markAllNotificationsAsRead);
router.delete("/clear-all", authMiddleware, deleteAllNotifications);

export default router;