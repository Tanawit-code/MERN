import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const friendRequestModel =
    mongoose.models.friendRequest ||
    mongoose.model("friendRequest", friendRequestSchema);

export default friendRequestModel;