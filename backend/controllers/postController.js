// ไฟล์นี้ดูแลระบบโพสต์ทั้งหมด เช่น:

// createPost สร้างโพสต์
// getPosts ดึงโพสต์หน้า Home
// toggleLike ไลก์ / ยกเลิกไลก์
// addComment เพิ่มคอมเมนต์
// deleteComment ลบคอมเมนต์
// deletePost ลบโพสต์

// จุดสำคัญของไฟล์นี้ในโปรเจกต์คุณ:

// หน้า Home ดึงเฉพาะโพสต์ที่ groupId: null
// ถ้าเป็นโพสต์ในกลุ่ม createPost จะเช็กก่อนว่า user เป็นสมาชิกกลุ่มหรือไม่
// การลบโพสต์เช็กว่าเป็นเจ้าของโพสต์จริงหรือไม่

import Post from "../models/Post.js";
import Group from "../models/Group.js";
import userModel from "../models/userModel.js";

// ➕ สร้างโพสต์
export const createPost = async (req, res) => {
    try {
        const { content, image, video, groupId } = req.body;
        const userId = req.userId;

        if ((!content || !content.trim()) && !image && !video) {
            return res.status(400).json({
                success: false,
                message: "กรุณาใส่ข้อความ รูปภาพ หรือวิดีโอ",
            });
        }

        if (groupId) {
            const group = await Group.findById(groupId);

            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบกลุ่ม",
                });
            }

            const isMember = group.members.some(
                (memberId) => memberId.toString() === userId
            );

            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: "เฉพาะสมาชิกกลุ่มเท่านั้นที่โพสต์ได้",
                });
            }
        }

        const user = await userModel.findById(userId);

        const newPost = new Post({
            userId,
            content: content || "",
            image: image || "",
            video: video || "",
            groupId: groupId || null,
            name: user?.name || "",
        });

        await newPost.save();

        const savedPost = await Post.findById(newPost._id).populate(
            "userId",
            "name profilePic"
        );

        return res.status(201).json({
            success: true,
            post: savedPost,
        });
    } catch (err) {
        console.log("CREATE POST ERROR:", err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// 📥 ดึงโพสต์ทั้งหมด
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ groupId: null })
            .populate("userId", "name profilePic")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 👍 ไลก์ / ยกเลิกไลก์
export const toggleLike = async (req, res) => {
    try {
        const userId = req.userId;
        const postId = req.params.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ userId",
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "ไม่เจอโพสต์",
            });
        }

        const isLiked = post.likes.some((id) => id.toString() === userId);

        if (isLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        return res.json({
            success: true,
            post,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// 💬 เพิ่มคอมเมนต์
export const addComment = async (req, res) => {
    const { id } = req.params;
    const { userId, name, text } = req.body;

    try {
        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอกข้อความคอมเมนต์",
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "ไม่เจอโพสต์",
            });
        }

        const user = await userModel.findById(req.userId);

        const newComment = {
            userId: req.userId,
            name: user?.name || "",
            profilePic: user?.profilePic || "",
            text: text.trim(),
            createdAt: new Date(),
        };

        post.comments.push(newComment);
        await post.save();

        const updatedPost = await Post.findById(id).populate(
            "userId",
            "name profilePic"
        );

        return res.json({
            success: true,
            post: updatedPost,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 🗑️ ลบคอมเมนต์
export const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "ไม่เจอโพสต์",
            });
        }

        post.comments = post.comments.filter(
            (c) => c._id.toString() !== commentId
        );

        await post.save();

        const updatedPost = await Post.findById(postId).populate(
            "userId",
            "name profilePic"
        );

        return res.json({
            success: true,
            post: updatedPost,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบโพสต์",
            });
        }

        // รองรับทั้ง ObjectId และ populate
        const postUserId =
            typeof post.userId === "object"
                ? post.userId._id.toString()
                : post.userId.toString();

        if (postUserId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "ไม่มีสิทธิ์ลบโพสต์นี้",
            });
        }

        // ถ้าเป็นโพสต์ในกลุ่ม
        if (post.groupId) {
            const group = await Group.findById(post.groupId);

            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบกลุ่มของโพสต์นี้",
                });
            }

            const isMember = group.members.some(
                (memberId) => memberId.toString() === req.userId
            );

            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: "คุณไม่ได้เป็นสมาชิกกลุ่มนี้แล้ว",
                });
            }
        }

        await Post.findByIdAndDelete(postId);

        res.json({
            success: true,
            message: "ลบโพสต์สำเร็จ",
        });
    } catch (err) {
        console.error("DELETE POST ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};