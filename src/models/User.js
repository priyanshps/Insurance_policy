import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        dob: {
            type: Date
        },

        address: {
            type: String,
            trim: true
        },

        phoneNumber: {
            type: String,
            trim: true
        },

        state: {
            type: String,
            trim: true
        },

        zipCode: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        gender: {
            type: String,
            trim: true
        },

        userType: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "users"
    }
);

export default mongoose.model("User", userSchema);