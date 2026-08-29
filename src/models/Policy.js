import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
    {
        policyNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        policyStartDate: {
            type: Date
        },

        policyEndDate: {
            type: Date
        },

        policyCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LOB",
            required: true
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Carrier",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    {
        timestamps: true,
        collection: "policies"
    }
);

export default mongoose.model("Policy", policySchema);