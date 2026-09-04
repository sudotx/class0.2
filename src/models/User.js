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
        role: { type: String, enum: ["user", "admin"], default: "user" },
        dateOfBirth: { type: Date },
        avatarUrl: { type: String },
        avatarPublicId: { type: String },
        phone: { type: String, trim: true },
        address: {
            line1: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true },
            postalCode: { type: String, trim: true },
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
