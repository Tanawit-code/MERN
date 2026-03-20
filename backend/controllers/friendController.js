import mongoose from "mongoose";
import friendRequestModel from "../models/friendRequestModel.js";
import friendshipModel from "../models/friendshipModel.js";
import userModel from "../models/userModel.js";

// helper
const makePairKey = (userA, userB) => {
    return [String(userA), String(userB)].sort().join("_");
};

// ค้นหาผู้ใช้สำหรับเพิ่มเพื่อน
export const searchUsers = async (req, res) => {
    try {
        const userId = req.userId;
        const keyword = req.query.keyword?.trim();

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ keyword",
            });
        }

        const users = await userModel
            .find({
                _id: { $ne: userId },
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { email: { $regex: keyword, $options: "i" } },
                ],
            })
            .select("_id name email profilePic")
            .limit(20);

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.log("searchUsers error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ส่งคำขอเป็นเพื่อน
export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.userId;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ receiverId",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "receiverId ไม่ถูกต้อง",
            });
        }

        if (String(senderId) === String(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้",
            });
        }

        const receiver = await userModel.findById(receiverId).select("_id");
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบผู้ใช้ปลายทาง",
            });
        }

        const pairKey = makePairKey(senderId, receiverId);
        const existingFriendship = await friendshipModel.findOne({ pairKey });

        if (existingFriendship) {
            return res.status(400).json({
                success: false,
                message: "เป็นเพื่อนกันอยู่แล้ว",
            });
        }

        const existingRequest = await friendRequestModel.findOne({
            sender: senderId,
            receiver: receiverId,
        });

        if (existingRequest) {
            if (existingRequest.status === "pending") {
                return res.status(400).json({
                    success: false,
                    message: "ส่งคำขอไปแล้ว",
                });
            }

            existingRequest.status = "pending";
            await existingRequest.save();

            return res.status(200).json({
                success: true,
                message: "ส่งคำขอเป็นเพื่อนใหม่สำเร็จ",
                request: existingRequest,
            });
        }

        const reverseRequest = await friendRequestModel.findOne({
            sender: receiverId,
            receiver: senderId,
            status: "pending",
        });

        if (reverseRequest) {
            return res.status(400).json({
                success: false,
                message: "อีกฝ่ายส่งคำขอหาคุณอยู่แล้ว กรุณากดรับคำขอแทน",
            });
        }

        const request = await friendRequestModel.create({
            sender: senderId,
            receiver: receiverId,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "ส่งคำขอเป็นเพื่อนสำเร็จ",
            request,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "ส่งคำขอไปแล้ว",
            });
        }

        console.log("sendFriendRequest error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดึงคำขอที่ได้รับ
export const getReceivedFriendRequests = async (req, res) => {
    try {
        const userId = req.userId;

        const requests = await friendRequestModel
            .find({
                receiver: req.userId,
                status: "pending",
            })
            .populate("sender", "_id name email profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        console.log("getReceivedFriendRequests error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดึงคำขอที่เราส่งไป
export const getSentFriendRequests = async (req, res) => {
    try {
        const userId = req.userId;

        const requests = await friendRequestModel
            .find({
                sender: userId,
                status: "pending",
            })
            .populate("receiver", "_id name email profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        console.log("getSentFriendRequests error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// รับคำขอเป็นเพื่อน
export const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({ success: false, message: "กรุณาระบุ requestId" });
        }

        const request = await friendRequestModel.findById(requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: "ไม่พบคำขอเป็นเพื่อน" });
        }

        if (String(request.receiver) !== String(userId)) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์จัดการคำขอนี้" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ success: false, message: "คำขอนี้ถูกจัดการไปแล้ว" });
        }

        // สร้าง pairKey
        const makePairKey = (userA, userB) => [String(userA), String(userB)].sort().join("_");
        const pairKey = makePairKey(request.sender, request.receiver);

        // ตรวจสอบว่า friendship มีอยู่แล้วหรือยัง
        const existingFriendship = await friendshipModel.findOne({ pairKey });

        if (!existingFriendship) {
            // ✅ สร้าง record พร้อม pairKey
            await friendshipModel.create({
                users: [request.sender, request.receiver],
                pairKey, // ต้องมี
            });
        }

        // เปลี่ยน status ของ request
        request.status = "accepted";
        await request.save();

        res.status(200).json({ success: true, message: "รับคำขอเป็นเพื่อนสำเร็จ" });

    } catch (error) {
        console.log("acceptFriendRequest error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ปฏิเสธคำขอ
export const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ requestId",
            });
        }

        const request = await friendRequestModel.findById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบคำขอเป็นเพื่อน",
            });
        }

        if (String(request.receiver) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์จัดการคำขอนี้",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "คำขอนี้ถูกจัดการไปแล้ว",
            });
        }

        request.status = "rejected";
        await request.save();

        res.status(200).json({
            success: true,
            message: "ปฏิเสธคำขอเป็นเพื่อนแล้ว",
        });
    } catch (error) {
        console.log("rejectFriendRequest error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ยกเลิกคำขอที่เราส่งไป
export const cancelFriendRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ requestId",
            });
        }

        const request = await friendRequestModel.findById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบคำขอเป็นเพื่อน",
            });
        }

        if (String(request.sender) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์ยกเลิกคำขอนี้",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "คำขอนี้ไม่สามารถยกเลิกได้",
            });
        }

        request.status = "cancelled";
        await request.save();

        res.status(200).json({
            success: true,
            message: "ยกเลิกคำขอเป็นเพื่อนแล้ว",
        });
    } catch (error) {
        console.log("cancelFriendRequest error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดึงรายชื่อเพื่อน
export const getFriends = async (req, res) => {
    try {
        const userId = req.userId;

        const friendships = await friendshipModel
            .find({
                users: userId,
            })
            .populate("users", "_id name email profilePic")
            .sort({ createdAt: -1 });

        const friends = friendships.map((friendship) => {
            return friendship.users.find(
                (user) => String(user._id) !== String(userId)
            );
        });

        res.status(200).json({
            success: true,
            friends,
        });
    } catch (error) {
        console.log("getFriends error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ลบเพื่อน
export const unfriend = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendId } = req.body;

        if (!friendId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ friendId",
            });
        }

        const pairKey = makePairKey(userId, friendId);

        const deleted = await friendshipModel.findOneAndDelete({ pairKey });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบความเป็นเพื่อนนี้",
            });
        }

        res.status(200).json({
            success: true,
            message: "ลบเพื่อนสำเร็จ",
        });
    } catch (error) {
        console.log("unfriend error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};