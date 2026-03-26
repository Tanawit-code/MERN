// คุมระบบกลุ่ม เช่น:
// createGroup
// deleteGroup
// joinGroup
// leaveGroup
// getGroups
// getGroupById
// getGroupPosts

// สรุปคือเป็น controller หลักของระบบ group ทั้งหมด
// โดย getGroupPosts ใช้ดึงโพสต์เฉพาะของกลุ่มนั้นจาก Post.find({ groupId: group._id })

import Group from "../models/Group.js";
import Post from "../models/Post.js";

// สร้างกลุ่ม
export const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "กรุณาใส่ชื่อกลุ่ม",
            });
        }

        let groupImage = "";
        if (req.file) {
            groupImage = `/uploads/groups/${req.file.filename}`;
        }

        const group = await Group.create({
            name: name.trim(),
            description: description || "",
            groupImage,
            owner: req.userId,
            members: [req.userId],
        });

        res.status(201).json({
            success: true,
            group,
        });
    } catch (error) {
        console.error("CREATE GROUP ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// แก้ไขกลุ่ม
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบกลุ่ม",
            });
        }

        if (group.owner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "เฉพาะเจ้าของกลุ่มเท่านั้นที่แก้ไขได้",
            });
        }

        if (name !== undefined) {
            group.name = name.trim();
        }

        if (description !== undefined) {
            group.description = description;
        }

        if (req.file) {
            group.groupImage = `/uploads/groups/${req.file.filename}`;
        }

        await group.save();

        res.json({
            success: true,
            message: "แก้ไขกลุ่มสำเร็จ",
            group,
        });
    } catch (error) {
        console.error("UPDATE GROUP ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ลบกลุ่ม
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบกลุ่ม",
            });
        }

        if (group.owner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "เฉพาะเจ้าของกลุ่มเท่านั้นที่ลบได้",
            });
        }

        await Post.deleteMany({ groupId: group._id });
        await Group.findByIdAndDelete(groupId);

        res.json({
            success: true,
            message: "ลบกลุ่มสำเร็จ",
        });
    } catch (error) {
        console.error("DELETE GROUP ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบกลุ่ม",
            });
        }

        const alreadyMember = group.members.some(
            (memberId) => memberId.toString() === req.userId
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "คุณเป็นสมาชิกอยู่แล้ว",
            });
        }

        group.members.push(req.userId);
        await group.save();

        res.json({
            success: true,
            message: "เข้าร่วมกลุ่มสำเร็จ",
            group,
        });
    } catch (error) {
        console.error("JOIN GROUP ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบกลุ่ม",
            });
        }

        if (group.owner.toString() === req.userId) {
            return res.status(400).json({
                success: false,
                message: "เจ้าของกลุ่มออกจากกลุ่มไม่ได้",
            });
        }

        group.members = group.members.filter(
            (memberId) => memberId.toString() !== req.userId
        );

        await group.save();

        res.json({
            success: true,
            message: "ออกจากกลุ่มสำเร็จ",
            group,
        });
    } catch (error) {
        console.error("LEAVE GROUP ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate("owner", "name email profilePic")
            .populate("members", "name email profilePic")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            groups,
        });
    } catch (error) {
        console.error("GET GROUPS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId)
            .populate("owner", "name email profilePic")
            .populate("members", "name email profilePic");

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบกลุ่ม",
            });
        }

        res.json({
            success: true,
            group,
        });
    } catch (error) {
        console.error("GET GROUP BY ID ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;

        const posts = await Post.find({ groupId })
            .populate("userId", "name email profilePic")
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            posts,
        });
    } catch (error) {
        console.error("GET GROUP POSTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};