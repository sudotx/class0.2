import { Schema, model } from "mongoose";

const apiKeySchema = new Schema({
    key: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

export default model("ApiKey", apiKeySchema);
