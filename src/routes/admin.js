import { Router } from "express";

import User from "../models/User.js";
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const [users, total] = await Promise.all([
        User.find().active().select("-password").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        User.find().active().countDocuments(),
    ]);

    res.json({ users, page, limit, total });
});

router.get("/users/:id", async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).active().select("-password");
    if (!user) {
        return res.status(404).json({ error: "user not found" });
    }
    res.json(user);
});

router.get("/orders", async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

export default router;
