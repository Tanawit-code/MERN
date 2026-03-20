import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    image: {
        type: String, // (optional)
    },
    likes: {
        type: Array,
        default: []
    },
    comments: [
        {
            userId: String,
            name: String,
            text: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;