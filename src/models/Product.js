import { Schema, model } from "mongoose";

const productSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        images: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
            },
        ],
        stock: { type: Number, default: 0, min: 0 },
        category: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true },
);

productSchema.query.active = function () {
    return this.where({ isActive: true });
};

export default model("Product", productSchema);
