import express from "express";
import { createPost, getPosts, toggleLike, addComment, deleteComment, deletePost } from "../controllers/postController.js";

const router = express.Router();

router.post("/create", createPost);
router.get("/all", getPosts);
router.post("/like/:id", toggleLike);
router.post("/comment/:id", addComment);
router.delete("/comment/:postId/:commentId", deleteComment);
router.delete("/:postId", deletePost);
export default router;