import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        pairKey: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

friendshipSchema.index({ user1: 1 });
friendshipSchema.index({ user2: 1 });
friendshipSchema.index({ pairKey: 1 }, { unique: true });

const friendshipModel =
    mongoose.models.Friendship ||
    mongoose.model("Friendship", friendshipSchema);

export default friendshipModel;