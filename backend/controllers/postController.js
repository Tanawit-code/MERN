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

export const toggleLike = async (req, res) => {
    try {
        const { userId } = req.body;
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.json({ success: false, message: "ไม่เจอโพสต์" });
        }

        const isLiked = post.likes.some(
            (id) => id.toString() === userId
        );

        if (isLiked) {
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.json({ success: true, post });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

export const addComment = async (req, res) => {
    const { id } = req.params;
    const { userId, name, text } = req.body;

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.json({ success: false });
        }

        const newComment = {
            userId,
            name,
            text,
            createdAt: new Date()
        };

        post.comments.push(newComment);

        await post.save();

        res.json({ success: true, post });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        const post = await Post.findById(postId);

        post.comments = post.comments.filter(
            (c) => c._id.toString() !== commentId
        );

        await post.save();

        res.json({ success: true, post });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

export const deletePost = async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    try {
        await Post.findByIdAndDelete(postId);

        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }

    if (post.userId !== req.userId) {
        return res.json({ success: false, message: "ไม่มีสิทธิ์" });
    }

    if (!window.confirm("ต้องการลบโพสต์นี้?")) return;

    await Post.findByIdAndDelete(postId);
};