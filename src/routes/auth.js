import { Router } from "express";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import { signToken } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "username, email and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() ? "admin" : "user";
        const user = await User.create({ username, email, password: hashedPassword, role });
        res.status(201).json({ status: "user registered", userId: user._id, role: user.role });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "username or email already taken" });
        }
        console.error(error);
        res.status(500).json({ error: "registration failed" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }

    const user = await User.findOne({ username }).active();
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    res.json({ status: "logged in", token: signToken(user._id) });
});

export default router;
