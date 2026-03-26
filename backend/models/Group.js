// เก็บข้อมูลกลุ่ม เช่น:
// name
// description
// coverImage
// owner
// members

// เจ้าของกลุ่มเก็บใน owner และสมาชิกเก็บใน members

import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        groupImage: {
            type: String,
            default: "",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        ],
    },
    { timestamps: true }
);

const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);
export default Group;