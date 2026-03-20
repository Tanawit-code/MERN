import conversationModel from "../models/conversationModel.js";
import friendshipModel from "../models/friendshipModel.js";

// ประกาศ makePairKey เฉพาะไฟล์นี้
const makePairKey = (userA, userB) => {
    return [String(userA), String(userB)].sort().join("_");
};

// สร้างหรือดึงห้องแชท 1:1
export const createOrGetPrivateConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendId } = req.body;

        const pairKey = makePairKey(userId, friendId); // ✅ ต้องเรียงเหมือน accept request

        const isFriend = await friendshipModel.findOne({ pairKey });
        if (!isFriend) {
            return res.status(403).json({ success: false, message: "ต้องเป็นเพื่อนกันก่อนจึงจะเริ่มแชทได้" });
        }

        let conversation = await conversationModel.findOne({ type: "private", pairKey })
            .populate("members", "_id name email profilePic");

        if (!conversation) {
            conversation = await conversationModel.create({
                type: "private",
                members: [userId, friendId],
                pairKey, // ✅ ต้องใส่
            });

            conversation = await conversationModel.findById(conversation._id)
                .populate("members", "_id name email profilePic");
        }

        res.status(200).json({ success: true, conversation });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ดึงห้องแชททั้งหมดของ user
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.userId;

        const conversations = await conversationModel
            .find({
                members: userId,
            })
            .populate("members", "_id name email profilePic")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            conversations,
        });
    } catch (error) {
        console.log("getMyConversations error:", error);
        res.status(500).json({
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

        res.status(200).json({
            success: true,
            conversation,
        });
    } catch (error) {
        console.log("getConversationById error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};