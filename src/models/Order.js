import { Schema, model } from "mongoose";

const addressSchema = {
    line1: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true },
};

const orderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
        paystackReference: { type: String, unique: true, sparse: true },
        shippingAddress: addressSchema,
    },
    { timestamps: true },
);

export default model("Order", orderSchema);
