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
        required: true
    },
    image: {
        type: String, // (optional)
    }
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;