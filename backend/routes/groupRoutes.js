import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    createGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    getGroups,
    getGroupById,
    getGroupPosts,
} from "../controllers/groupController.js";

const router = express.Router();

router.get("/", getGroups);
router.get("/:groupId", getGroupById);

//ไม่อยากให้คนเห็นโพส
// router.get("/:groupId/posts", authMiddleware, getGroupPosts); 

//อยากให้คนเห็นโพส
router.get("/:groupId/posts", getGroupPosts);

router.post("/", authMiddleware, createGroup);
router.post("/:groupId/join", authMiddleware, joinGroup);
router.post("/:groupId/leave", authMiddleware, leaveGroup);
router.delete("/:groupId", authMiddleware, deleteGroup);

export default router;