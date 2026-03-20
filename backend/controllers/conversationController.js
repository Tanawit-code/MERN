import mongoose from "mongoose";
import conversationModel from "../models/conversationModel.js";
import friendshipModel from "../models/friendshipModel.js";

const makePairKey = (userA, userB) => {
    return [String(userA), String(userB)].sort().join("_");
};

// สร้างหรือดึงห้องแชท 1:1
export const createOrGetPrivateConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendId } = req.body;

        if (!friendId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ friendId",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({
                success: false,
                message: "friendId ไม่ถูกต้อง",
            });
        }

        if (String(userId) === String(friendId)) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถสร้างห้องแชทกับตัวเองได้",
            });
        }

        const pairKey = makePairKey(userId, friendId);

        const isFriend = await friendshipModel.findOne({ pairKey });
        if (!isFriend) {
            return res.status(403).json({
                success: false,
                message: "ต้องเป็นเพื่อนกันก่อนจึงจะเริ่มแชทได้",
            });
        }

        let conversation = await conversationModel
            .findOne({ type: "private", pairKey })
            .populate("members", "_id name email profilePic");

        if (!conversation) {
            conversation = await conversationModel.create({
                type: "private",
                members: [userId, friendId],
                pairKey,
            });

            conversation = await conversationModel
                .findById(conversation._id)
                .populate("members", "_id name email profilePic");
        }

        return res.status(200).json({
            success: true,
            conversation,
        });
    } catch (error) {
        console.log("createOrGetPrivateConversation error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดึงห้องแชททั้งหมดของ user
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.userId;

        const conversations = await conversationModel
            .find({ members: userId })
            .populate("members", "_id name email profilePic")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            conversations,
        });
    } catch (error) {
        console.log("getMyConversations error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดึงรายละเอียดห้องเดียว
export const getConversationById = async (req, res) => {
    try {
        const userId = req.userId;
        const { conversationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "conversationId ไม่ถูกต้อง",
            });
        }

        const conversation = await conversationModel
            .findById(conversationId)
            .populate("members", "_id name email profilePic");

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบห้องสนทนา",
            });
        }

        const isMember = conversation.members.some(
            (member) => String(member._id) === String(userId)
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์เข้าถึงห้องนี้",
            });
        }

        return res.status(200).json({
            success: true,
            conversation,
        });
    } catch (error) {
        console.log("getConversationById error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};