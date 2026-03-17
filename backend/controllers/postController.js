import Post from "../models/Post.js";

// ➕ สร้างโพสต์
export const createPost = async (req, res) => {
    try {
        const { userId, name, content } = req.body;

        const newPost = new Post({
            userId,
            name,
            content
        });

        await newPost.save();

        res.status(201).json({
            success: true,
            post: newPost
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📥 ดึงโพสต์ทั้งหมด
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            posts
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};