import mongoose from "mongoose";
import friendRequestModel from "../models/friendRequestModel.js";
import friendshipModel from "../models/friendshipModel.js";
import userModel from "../models/userModel.js";

const makePairKey = (userA, userB) => {
    return [String(userA), String(userB)].sort().join("_");
};

const syncFollowBothWays = async (userAId, userBId) => {
    const [userA, userB] = await Promise.all([
        userModel.findById(userAId),
        userModel.findById(userBId),
    ]);

    if (!userA || !userB) return;

    const aFollowingB = userA.following.some(
        (id) => id.toString() === userB._id.toString()
    );
    const bFollowingA = userB.following.some(
        (id) => id.toString() === userA._id.toString()
    );

    if (!aFollowingB) userA.following.push(userB._id);
    if (!bFollowingA) userB.following.push(userA._id);

    const aInFollowers = userA.followers.some(
        (id) => id.toString() === userB._id.toString()
    );
    const bInFollowers = userB.followers.some(
        (id) => id.toString() === userA._id.toString()
    );

    if (!aInFollowers) userA.followers.push(userB._id);
    if (!bInFollowers) userB.followers.push(userA._id);

    await Promise.all([userA.save(), userB.save()]);
};

const unsyncFollowBothWays = async (userAId, userBId) => {
    const [userA, userB] = await Promise.all([
        userModel.findById(userAId),
        userModel.findById(userBId),
    ]);

    if (!userA || !userB) return;

    userA.following = userA.following.filter(
        (id) => id.toString() !== userB._id.toString()
    );
    userA.followers = userA.followers.filter(
        (id) => id.toString() !== userB._id.toString()
    );

    userB.following = userB.following.filter(
        (id) => id.toString() !== userA._id.toString()
    );
    userB.followers = userB.followers.filter(
        (id) => id.toString() !== userA._id.toString()
    );

    await Promise.all([userA.save(), userB.save()]);
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

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.log("searchUsers error:", error);
        return res.status(500).json({
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

        let existingRequest = await friendRequestModel.findOne({
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
        const requests = await friendRequestModel
            .find({
                receiver: req.userId,
                status: "pending",
            })
            .populate("sender", "_id name email profilePic")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        console.log("getReceivedFriendRequests error:", error);
        return res.status(500).json({
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

        return res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        console.log("getSentFriendRequests error:", error);
        return res.status(500).json({
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

        const pairKey = makePairKey(request.sender, request.receiver);

        const existingFriendship = await friendshipModel.findOne({ pairKey });
        if (!existingFriendship) {
            await friendshipModel.create({
                users: [request.sender, request.receiver],
                pairKey,
            });
        }

        request.status = "accepted";
        await request.save();

        // ✅ เชื่อมระบบ follow ให้ติดตามกันอัตโนมัติ
        await syncFollowBothWays(request.sender, request.receiver);

        return res.status(200).json({
            success: true,
            message: "รับคำขอเป็นเพื่อนสำเร็จ",
        });
    } catch (error) {
        console.log("acceptFriendRequest error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
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

        return res.status(200).json({
            success: true,
            message: "ปฏิเสธคำขอเป็นเพื่อนแล้ว",
        });
    } catch (error) {
        console.log("rejectFriendRequest error:", error);
        return res.status(500).json({
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

        return res.status(200).json({
            success: true,
            message: "ยกเลิกคำขอเป็นเพื่อนแล้ว",
        });
    } catch (error) {
        console.log("cancelFriendRequest error:", error);
        return res.status(500).json({
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
            .find({ users: userId })
            .populate("users", "_id name email profilePic")
            .sort({ createdAt: -1 });

        const friends = friendships
            .map((friendship) =>
                friendship.users.find((user) => String(user._id) !== String(userId))
            )
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            friends,
        });
    } catch (error) {
        console.log("getFriends error:", error);
        return res.status(500).json({
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

        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({
                success: false,
                message: "friendId ไม่ถูกต้อง",
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

        // ✅ เลิกติดตามกันอัตโนมัติเมื่อเลิกเป็นเพื่อน
        await unsyncFollowBothWays(userId, friendId);

        return res.status(200).json({
            success: true,
            message: "ลบเพื่อนสำเร็จ",
        });
    } catch (error) {
        console.log("unfriend error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getSuggestions = async (req, res) => {
    try {
        const userId = req.userId;

        // เพื่อนทั้งหมด
        const friendships = await friendshipModel.find({
            users: userId,
        });

        const friendIds = friendships.flatMap((f) =>
            f.users.map((id) => id.toString())
        );

        // request ที่เคยส่งไปแล้ว
        const sentRequests = await friendRequestModel.find({
            sender: userId,
            status: "pending",
        });

        const requestedIds = sentRequests.map((r) => r.receiver.toString());

        const excludeIds = [
            ...friendIds,
            ...requestedIds,
            String(userId),
        ];

        const users = await userModel.find({
            _id: { $nin: excludeIds },
        })
            .select("_id name email profilePic")
            .limit(10);

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.log("getSuggestions error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
