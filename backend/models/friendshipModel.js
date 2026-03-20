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
        name: {
            type: String,
            required: true
        },
        pairKey: { type: String, required: true, unique: true }, // ✅ ต้องมี
    },
    { timestamps: true }
);

friendshipSchema.index({ users: 1 });

const friendshipModel = mongoose.model("Friendship", friendshipSchema);
export default friendshipModel;