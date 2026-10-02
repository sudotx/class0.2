import { Router } from "express";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { upload } from "../middleware/upload.js";
import { uploadImage, destroyImage } from "../utils/cloudinary.js";

const DELETION_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
const PROFILE_FIELDS = ["username", "dateOfBirth", "phone"];

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findOne({ _id: req.userId }).active().select("-password");
    if (!user) {
        return res.status(404).json({ error: "user not found" });
    }
    res.json(user);
});

router.patch("/me", requireAuth, async (req, res) => {
    const update = {};
    for (const field of PROFILE_FIELDS) {
        if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    try {
        const user = await User.findOneAndUpdate({ _id: req.userId }, update, { new: true })
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

router.patch("/me/password", requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }

    const user = await User.findOne({ _id: req.userId }).active();
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ error: "current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ status: "password updated" });
});

router.post("/me/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "avatar file is required" });
    }

    try {
        const user = await User.findOne({ _id: req.userId }).active();
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        const result = await uploadImage(req.file.buffer, "avatars");
        if (user.avatarPublicId) {
            destroyImage(user.avatarPublicId);
        }

        user.avatarUrl = result.url;
        user.avatarPublicId = result.publicId;
        await user.save();

        res.json({ avatarUrl: user.avatarUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "avatar upload failed" });
    }
});

router.delete("/me", requireAuth, async (req, res) => {
    const scheduledDeletionAt = new Date(Date.now() + DELETION_GRACE_PERIOD_MS);

    try {
        const user = await User.findOneAndUpdate(
            { _id: req.userId, deletionRequestedAt: null },
            { deletionRequestedAt: new Date(), scheduledDeletionAt },
        );
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

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
