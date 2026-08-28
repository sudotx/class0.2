import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: { type: String, required: true },
        accountBalance: {
            type: Number
        },
        deletionRequestedAt: { type: Date, default: null },
        scheduledDeletionAt: { type: Date, default: null },
    },
    { timestamps: true },
);

userSchema.query.active = function () {
    return this.where({ deletionRequestedAt: null });
};

export default model("User", userSchema);
