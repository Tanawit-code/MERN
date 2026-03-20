import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["private", "group"],
            default: "private",
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true,
            },
        ],
        pairKey: {
            type: String,
            default: null,
            unique: true,
            sparse: true,
        },
    },
    { timestamps: true }
);

const ConversationModel =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", conversationSchema);

export default ConversationModel;