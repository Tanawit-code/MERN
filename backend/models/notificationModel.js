import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null,
        },
        type: {
            type: String,
            enum: ["friend_request", "new_message"],
            required: true,
        },
        title: {
            type: String,
            default: "",
        },
        body: {
            type: String,
            default: "",
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "conversation",
            default: null,
        },
        friendRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "friendRequest",
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const notificationModel =
    mongoose.models.notification ||
    mongoose.model("notification", notificationSchema);

export default notificationModel;