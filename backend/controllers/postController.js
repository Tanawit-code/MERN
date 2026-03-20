import Post from "../models/Post.js";

// ➕ สร้างโพสต์
export const createPost = async (req, res) => {
    try {
        const { userId, name, profilePic, content, image, video } = req.body;

        if (!userId || !name) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ userId และ name",
            });
        }

        if ((!content || !content.trim()) && !image && !video) {
            return res.status(400).json({
                success: false,
                message: "กรุณาใส่ข้อความ รูป หรือวิดีโอ",
            });
        }

        const newPost = new Post({
            userId,
            content: content || "",
            image: image || "",
            video: video || "",
        });

        await newPost.save();

        return res.status(201).json({
            success: true,
            post: newPost,
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
        const posts = await Post.find()
            .populate("userId", "name profilePic")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 👍 ไลก์ / ยกเลิกไลก์
export const toggleLike = async (req, res) => {
    try {
        const { userId } = req.body;
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

        const newComment = {
            userId: userId || "",
            name: name || "",
            text: text.trim(),
            createdAt: new Date(),
        };

        post.comments.push(newComment);
        await post.save();

        return res.json({
            success: true,
            post,
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

// 🗑️ ลบโพสต์
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "ไม่เจอโพสต์",
            });
        }

        if (post.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "ไม่มีสิทธิ์ลบโพสต์นี้",
            });
        }

        await Post.findByIdAndDelete(postId);

        return res.json({
            success: true,
            message: "ลบโพสต์สำเร็จ",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};