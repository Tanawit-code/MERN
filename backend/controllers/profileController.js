import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import Post from "../models/Post.js";

// helper: แปลงข้อมูล user สำหรับส่งกลับ frontend
const formatUserProfile = async (targetUser, currentUserId) => {
    const postsCount = await Post.countDocuments({
        userId: targetUser._id,
        groupId: null,
    });

    const isFollowing = targetUser.followers.some(
        (id) => id.toString() === currentUserId
    );

    return {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        profilePic: targetUser.profilePic || "",
        coverPic: targetUser.coverPic || "",
        bio: targetUser.bio || "",
        createdAt: targetUser.createdAt,

        followersCount: targetUser.followers.length,
        followingCount: targetUser.following.length,
        postsCount,
        isFollowing,
    };
};

// โปรไฟล์ของตัวเอง
export const getMyProfile = async (req, res) => {
    try {
        const currentUserId = req.userId;

        const user = await userModel.findById(currentUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบผู้ใช้",
            });
        }

        const profile = await formatUserProfile(user, currentUserId);

        return res.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error("GET MY PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// โปรไฟล์ของคนอื่นตาม userId
export const getUserProfile = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "userId ไม่ถูกต้อง",
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบผู้ใช้",
            });
        }

        const profile = await formatUserProfile(user, currentUserId);

        return res.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error("GET USER PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// follow / unfollow
export const toggleFollow = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "userId ไม่ถูกต้อง",
            });
        }

        if (currentUserId === userId) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถติดตามตัวเองได้",
            });
        }

        const me = await userModel.findById(currentUserId);
        const targetUser = await userModel.findById(userId);

        if (!me || !targetUser) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบผู้ใช้",
            });
        }

        const alreadyFollowing = me.following.some(
            (id) => id.toString() === userId
        );

        if (alreadyFollowing) {
            me.following = me.following.filter((id) => id.toString() !== userId);
            targetUser.followers = targetUser.followers.filter(
                (id) => id.toString() !== currentUserId
            );
        } else {
            me.following.push(targetUser._id);
            targetUser.followers.push(me._id);
        }

        await me.save();
        await targetUser.save();

        const profile = await formatUserProfile(targetUser, currentUserId);

        return res.json({
            success: true,
            message: alreadyFollowing ? "เลิกติดตามสำเร็จ" : "ติดตามสำเร็จ",
            isFollowing: !alreadyFollowing,
            profile,
        });
    } catch (error) {
        console.error("TOGGLE FOLLOW ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// แนะนำคนให้ติดตาม
export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUserId = req.userId;

        const me = await userModel.findById(currentUserId);
        if (!me) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบผู้ใช้",
            });
        }

        const excludeIds = [me._id, ...me.following];

        const users = await userModel
            .find({
                _id: { $nin: excludeIds },
            })
            .select("name email profilePic bio followers following createdAt")
            .sort({ createdAt: -1 })
            .limit(8);

        const suggestions = await Promise.all(
            users.map(async (user) => {
                const postsCount = await Post.countDocuments({
                    userId: user._id,
                    groupId: null,
                });

                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic || "",
                    bio: user.bio || "",
                    followersCount: user.followers?.length || 0,
                    followingCount: user.following?.length || 0,
                    postsCount,
                    isFollowing: false,
                };
            })
        );

        return res.json({
            success: true,
            users: suggestions,
        });
    } catch (error) {
        console.error("GET SUGGESTED USERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};