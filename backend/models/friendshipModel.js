import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
    {
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true,
            },
        ],
        pairKey: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

friendshipSchema.index({ users: 1 });

const friendshipModel =
    mongoose.models.Friendship ||
    mongoose.model("Friendship", friendshipSchema);

export default friendshipModel;