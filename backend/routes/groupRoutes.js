// กำหนด route สำหรับกลุ่ม:
// GET /
// GET /:groupId
// GET /:groupId/posts
// POST /
// POST /:groupId/join
// POST /:groupId/leave
// DELETE /:groupId

// เป็นตัวเชื่อม frontend เข้ากับ groupController

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadGroupImage from "../middleware/upload.js";
import {
    createGroup,
    updateGroup,
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
router.get("/:groupId/posts", getGroupPosts);

router.post(
    "/",
    authMiddleware,
    uploadGroupImage.single("groupImage"),
    createGroup
);

router.put(
    "/:groupId",
    authMiddleware,
    uploadGroupImage.single("groupImage"),
    updateGroup
);

router.post("/:groupId/join", authMiddleware, joinGroup);
router.post("/:groupId/leave", authMiddleware, leaveGroup);
router.delete("/:groupId", authMiddleware, deleteGroup);

export default router;