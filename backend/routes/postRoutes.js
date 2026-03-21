import express from "express";
import {
    createPost,
    getPosts,
    toggleLike,
    addComment,
    deleteComment,
    deletePost,
} from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", getPosts);

router.post("/create", authMiddleware, createPost);
router.post("/like/:id", authMiddleware, toggleLike);
router.post("/comment/:id", authMiddleware, addComment);
router.delete("/comment/:postId/:commentId", authMiddleware, deleteComment);
router.delete("/:postId", authMiddleware, deletePost);

export default router;