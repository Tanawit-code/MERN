
// เก็บ schema ของโพสต์และคอมเมนต์ โดยในโปรเจกต์นี้มี: userId content image video groupId likes comments

// ใน commentSchema ตอนนี้มี: userId name profilePic text createdAt


import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            default: "",
        },
        profilePic: {
            type: String,
            default: "",
        },
        text: {
            type: String,
            default: "",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },

    },
    { _id: true }
);

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        content: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        },
        video: {
            type: String,
            default: "",
        },
        likes: {
            type: [String],
            default: [],
        },
        comments: {
            type: [commentSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;