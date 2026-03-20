import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        text: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const messageModel =
    mongoose.models.Message || mongoose.model("Message", messageSchema);

export default messageModel;