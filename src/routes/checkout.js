import { Router } from "express";
import { randomUUID } from "crypto";
import express from "express";

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { computeOrderTotal } from "../utils/orderTotal.js";
import { initializeTransaction, verifyTransaction, verifyWebhookSignature } from "../utils/paystack.js";

const router = Router();

async function markOrderPaid(order) {
    if (order.status === "paid") return; // idempotent
    order.status = "paid";
    await order.save();
    await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
}

router.post("/initialize", requireAuth, async (req, res) => {
    const [cart, user] = await Promise.all([
        Cart.findOne({ userId: req.userId }),
        User.findOne({ _id: req.userId }).active(),
    ]);

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "cart is empty" });
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).active();

    let items, totalAmount;
    try {
        ({ items, totalAmount } = computeOrderTotal(cart.items, products));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    const reference = randomUUID();
    const shippingAddress = req.body.shippingAddress || user.address;

    try {
        const order = await Order.create({
            userId: req.userId,
            items,
            totalAmount,
            status: "pending",
            paystackReference: reference,
            shippingAddress,
        });

        const { authorizationUrl } = await initializeTransaction({
            email: user.email,
            amount: totalAmount,
            reference,
            callbackUrl: `${process.env.FRONTEND_URL?.split(",")[0]}/checkout/callback`,
        });

        res.json({ authorizationUrl, orderId: order._id, reference });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "checkout initialization failed" });
    }
});

router.get("/verify/:reference", requireAuth, async (req, res) => {
    const order = await Order.findOne({ paystackReference: req.params.reference, userId: req.userId });
    if (!order) {
        return res.status(404).json({ error: "order not found" });
    }

    try {
        const result = await verifyTransaction(req.params.reference);
        if (result.status === "success") {
            await markOrderPaid(order);
        } else if (order.status === "pending") {
            order.status = "failed";
            await order.save();
        }
        res.json({ status: order.status, orderId: order._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "verification failed" });
    }
});

// Mounted directly in app.js ahead of the global json() parser, since
// signature verification needs the raw request body.
export const paystackWebhookRaw = express.raw({ type: "application/json" });

export async function paystackWebhookHandler(req, res) {
    const signature = req.headers["x-paystack-signature"];
    if (!signature || !verifyWebhookSignature(req.body, signature)) {
        return res.status(401).json({ error: "invalid signature" });
    }

    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event === "charge.success") {
        const order = await Order.findOne({ paystackReference: event.data.reference });
        if (order) await markOrderPaid(order);
    }

    res.status(200).json({ received: true });
}

export default router;
