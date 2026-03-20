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