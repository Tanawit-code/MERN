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
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// กัน request ซ้ำ sender -> receiver ที่ยัง pending อยู่
friendRequestSchema.index(
    { sender: 1, receiver: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "pending" } }
);

const friendRequestModel =
    mongoose.models.friendRequest ||
    mongoose.model("friendRequest", friendRequestSchema);

export default friendRequestModel;