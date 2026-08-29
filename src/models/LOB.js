import mongoose from "mongoose";

const lobSchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "lobs"
    }
);

export default mongoose.model("LOB", lobSchema);