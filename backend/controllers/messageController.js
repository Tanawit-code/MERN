import mongoose from "mongoose";
import messageModel from "../models/messageModel.js";
import conversationModel from "../models/conversationModel.js";
import notificationModel from "../models/notificationModel.js";

export const sendMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const { conversationId, text, media, mediaType } = req.body;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ conversationId",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "conversationId ไม่ถูกต้อง",
            });
        }

        if ((!text || !text.trim()) && !media) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุข้อความหรือไฟล์",
            });
        }

        const conversation = await conversationModel.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบห้องสนทนา",
            });
        }

        const isMember = conversation.members.some(
            (member) => String(member) === String(userId)
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์ส่งข้อความในห้องนี้",
            });
        }

        const message = await messageModel.create({
            conversationId,
            sender: userId,
            text: text?.trim() || "",
            media: media || "",
            mediaType: mediaType || "",
        });

        conversation.updatedAt = new Date();
        await conversation.save();

        const populatedMessage = await messageModel
            .findById(message._id)
            .populate("sender", "_id name email profilePic");

        const senderName =
            populatedMessage?.sender?.name || "มีผู้ใช้ส่งข้อความ";

        const receivers = conversation.members.filter(
            (member) => String(member) !== String(userId)
        );

        if (receivers.length > 0) {
            const notificationDocs = receivers.map((receiverId) => ({
                user: receiverId,
                sender: userId,
                type: "new_message",
                title: "ข้อความใหม่",
                body: `${senderName} ส่งข้อความหาคุณ`,
                conversationId: conversation._id,
            }));

            await notificationModel.insertMany(notificationDocs);
        }

        return res.status(201).json({
            success: true,
            message: "ส่งข้อความสำเร็จ",
            data: populatedMessage,
        });
    } catch (error) {
        console.log("sendMessage error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMessagesByConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const { conversationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "conversationId ไม่ถูกต้อง",
            });
        }

        const conversation = await conversationModel.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบห้องสนทนา",
            });
        }

        const isMember = conversation.members.some(
            (member) => String(member) === String(userId)
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์ดูข้อความในห้องนี้",
            });
        }

        const messages = await messageModel
            .find({ conversationId })
            .populate("sender", "_id name email profilePic")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.log("getMessagesByConversation error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};