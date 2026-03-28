import notificationModel from "../models/notificationModel.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel
            .find({ user: req.userId })
            .populate("sender", "_id name email profilePic")
            .sort({ createdAt: -1 })
            .limit(30);

        return res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.log("getMyNotifications error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await notificationModel.countDocuments({
            user: req.userId,
            isRead: false,
        });

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.log("getUnreadNotificationCount error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        const notification = await notificationModel.findOneAndUpdate(
            { _id: notificationId, user: req.userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบการแจ้งเตือน",
            });
        }

        return res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        console.log("markNotificationAsRead error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await notificationModel.updateMany(
            { user: req.userId, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({
            success: true,
            message: "อ่านแจ้งเตือนทั้งหมดแล้ว",
        });
    } catch (error) {
        console.log("markAllNotificationsAsRead error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const markMessageNotificationsByConversation = async (req, res) => {
    try {
        const { conversationId } = req.body;

        await notificationModel.updateMany(
            {
                user: req.userId,
                type: "new_message",
                conversationId,
                isRead: false,
            },
            { isRead: true }
        );

        return res.json({ success: true });
    } catch (error) {
        console.log("markMessageNotificationsByConversation error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markFriendRequestNotificationsRead = async (req, res) => {
    try {
        await notificationModel.updateMany(
            {
                user: req.userId,
                type: "friend_request",
                isRead: false,
            },
            { isRead: true }
        );

        return res.json({ success: true });
    } catch (error) {
        console.log("markFriendRequestNotificationsRead error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAllNotifications = async (req, res) => {
    try {
        await notificationModel.deleteMany({
            user: req.userId,
        });

        return res.status(200).json({
            success: true,
            message: "ลบการแจ้งเตือนทั้งหมดแล้ว",
        });
    } catch (error) {
        console.log("deleteAllNotifications error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};