import messageModel from "../models/MessageModel.js";
import conversationModel from "../models/ConversationModel.js";

// ส่งข้อความ
export const sendMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const { conversationId, text } = req.body;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ conversationId",
            });
        }

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุข้อความ",
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
            text: text.trim(),
        });

        // อัปเดต updatedAt ของห้อง
        conversation.updatedAt = new Date();
        await conversation.save();

        const populatedMessage = await messageModel
            .findById(message._id)
            .populate("sender", "_id name email profilePic");

        res.status(201).json({
            success: true,
            message: "ส่งข้อความสำเร็จ",
            data: populatedMessage,
        });
    } catch (error) {
        console.log("sendMessage error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดึงข้อความทั้งหมดในห้อง
export const getMessagesByConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const { conversationId } = req.params;

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

        res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.log("getMessagesByConversation error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};