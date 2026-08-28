import { Router } from "express";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import {
    sendWelcomeEmail,
    sendDeletionScheduledEmail,
} from "../utils/email.js";

const DELETION_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const router = Router();

router.post("/", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ error: "username, email and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        sendWelcomeEmail(user.email, user.username);

        res.status(201).json({
            status: "user registered",
            userId: user._id,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "username or email already taken" });
        }
        console.error(error);
        res.status(500).json({ error: "registration failed" });
    }
});

router.get("/", async (req, res) => {
    const users = await User.find().active().select("-password");
    res.json(users);
});

router.get("/:id", async (req, res) => {
    const user = await User.findOne({ _id: req.params.id })
        .active()
        .select("-password");
    if (!user) {
        return res.status(404).json({ error: "user not found" });
    }
    res.json(user);
});

router.patch("/:id", async (req, res) => {
    const { username, password } = req.body;
    const update = {};
    if (username) update.username = username;
    if (password) update.password = await bcrypt.hash(password, 10);

    try {
        const user = await User.findOneAndUpdate({ _id: req.params.id }, update, {
            new: true,
        })
            .active()
            .select("-password");
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }
        res.json(user);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "username already taken" });
        }
        console.error(error);
        res.status(500).json({ error: "update failed" });
    }
});

router.delete("/:id", async (req, res) => {
    const scheduledDeletionAt = new Date(Date.now() + DELETION_GRACE_PERIOD_MS);

    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, deletionRequestedAt: null },
            { deletionRequestedAt: new Date(), scheduledDeletionAt },
        );
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        sendDeletionScheduledEmail(user.email, user.username, scheduledDeletionAt);

        res.status(202).json({
            status: "deletion scheduled",
            scheduledDeletionAt: scheduledDeletionAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "deletion request failed" });
    }
});

export default router;
