import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
    {
        agentName: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "agents"
    }
);

export default mongoose.model("Agent", agentSchema);