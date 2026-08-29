import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
            trim: true
        },

        scheduledAt: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "inserted"],
            default: "pending"
        }
    },
    {
        timestamps: true,
        collection: "messages"
    }
);

export default mongoose.model("Message", messageSchema);