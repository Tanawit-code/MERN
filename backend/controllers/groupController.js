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

import mongoose from "mongoose";
import Group from "../models/Group.js";
import Post from "../models/Post.js";
import userModel from "../models/userModel.js";

// สร้างกลุ่ม
export const createGroup = async (req, res) => {
    try {
        const { name, description, coverImage } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "กรุณาใส่ชื่อกลุ่ม",
            });
        }

        const group = await Group.create({
            name: name.trim(),
            description: description || "",
            coverImage: coverImage || "",
            owner: req.userId,
            members: [req.userId],
        });

        res.status(201).json({
            success: true,
            group,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ลบกลุ่ม (เฉพาะ owner)
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
                message: "มีเพียงเจ้าของกลุ่มเท่านั้นที่ลบกลุ่มได้",
            });
        }

        await Post.deleteMany({ groupId: group._id });
        await Group.findByIdAndDelete(groupId);

        res.json({
            success: true,
            message: "ลบกลุ่มสำเร็จ",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// เข้าร่วมกลุ่ม
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ออกจากกลุ่ม
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
                message: "เจ้าของกลุ่มออกไม่ได้ ให้ลบกลุ่มแทน",
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดูกลุ่มทั้งหมด
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดูกลุ่มเดียว
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ดูโพสต์ในกลุ่ม
export const getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบกลุ่ม",
            });
        }

        // // 🔐 เช็คสมาชิก
        // const isMember = group.members.some(
        //     (memberId) => memberId.toString() === req.userId
        // );

        // if (!isMember) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "เฉพาะสมาชิกกลุ่มเท่านั้นที่ดูโพสต์ได้",
        //     });
        // }

        const posts = await Post.find({ groupId: group._id })
            .populate("userId", "name profilePic")
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