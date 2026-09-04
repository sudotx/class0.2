import { Router } from "express";

import Order from "../models/Order.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
});

router.get("/:id", async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) {
        return res.status(404).json({ error: "order not found" });
    }
    res.json(order);
});

export default router;
