import { Router } from "express";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { notifyAdmin } from "../utils/telegram.js";

const router = Router();

router.use(requireAuth);

async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
        notifyAdmin(`🛒 New cart started by user ${userId}`);
    }
    return cart;
}

router.get("/", async (req, res) => {
    const cart = await getOrCreateCart(req.userId);
    const populated = await cart.populate("items.productId", "name price stock images isActive");
    res.json(populated);
});

router.post("/items", async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ error: "productId and a positive quantity are required" });
    }

    const product = await Product.findOne({ _id: productId }).active();
    if (!product) {
        return res.status(404).json({ error: "product not found" });
    }
    if (quantity > product.stock) {
        return res.status(400).json({ error: "quantity exceeds available stock" });
    }

    const cart = await getOrCreateCart(req.userId);
    const existing = cart.items.find((item) => item.productId.toString() === productId);
    if (existing) {
        existing.quantity = quantity;
    } else {
        cart.items.push({ productId, quantity });
    }
    await cart.save();

    const populated = await cart.populate("items.productId", "name price stock images isActive");
    res.json(populated);
});

router.patch("/items/:productId", async (req, res) => {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
        return res.status(400).json({ error: "a non-negative quantity is required" });
    }

    const cart = await getOrCreateCart(req.userId);
    const index = cart.items.findIndex((item) => item.productId.toString() === req.params.productId);
    if (index === -1) {
        return res.status(404).json({ error: "item not in cart" });
    }

    if (quantity === 0) {
        cart.items.splice(index, 1);
    } else {
        cart.items[index].quantity = quantity;
    }
    await cart.save();

    const populated = await cart.populate("items.productId", "name price stock images isActive");
    res.json(populated);
});

router.delete("/items/:productId", async (req, res) => {
    const cart = await getOrCreateCart(req.userId);
    cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId);
    await cart.save();
    res.status(204).end();
});

router.delete("/", async (req, res) => {
    await Cart.findOneAndUpdate({ userId: req.userId }, { items: [] });
    res.status(204).end();
});

export default router;
