import mongoose from "mongoose";

const userAccountSchema = new mongoose.Schema(
    {
        accountName: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "user_accounts"
    }
);

export default mongoose.model("UserAccount", userAccountSchema);