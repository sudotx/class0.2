import { Router } from "express";

import Product from "../models/Product.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { upload } from "../middleware/upload.js";
import { uploadImage, destroyImage } from "../utils/cloudinary.js";
import { notifyAdmin } from "../utils/telegram.js";

const router = Router();

router.get("/", async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const [products, total] = await Promise.all([
        Product.find(filter).active().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Product.find(filter).active().countDocuments(),
    ]);

    res.json({ products, page, limit, total });
});

router.get("/:id", async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id }).active();
    if (!product) {
        return res.status(404).json({ error: "product not found" });
    }
    res.json(product);
});

router.post("/", requireAuth, requireAdmin, upload.array("images", 5), async (req, res) => {
    const { name, description, price, stock, category } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({ error: "name and price are required" });
    }

    try {
        const images = await Promise.all(
            (req.files || []).map((file) => uploadImage(file.buffer, "products")),
        );

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            images,
            createdBy: req.userId,
        });

        notifyAdmin(`📦 New product: <b>${product.name}</b> — ₦${product.price} (stock ${product.stock})`);
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "product creation failed" });
    }
});

router.patch("/:id", requireAuth, requireAdmin, upload.array("images", 5), async (req, res) => {
    const { name, description, price, stock, category } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (price !== undefined) update.price = price;
    if (stock !== undefined) update.stock = stock;
    if (category !== undefined) update.category = category;

    try {
        const product = await Product.findOne({ _id: req.params.id }).active();
        if (!product) {
            return res.status(404).json({ error: "product not found" });
        }

        if (req.files?.length) {
            const newImages = await Promise.all(
                req.files.map((file) => uploadImage(file.buffer, "products")),
            );
            update.images = [...product.images, ...newImages];
        }

        Object.assign(product, update);
        await product.save();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "product update failed" });
    }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    const product = await Product.findOneAndUpdate(
        { _id: req.params.id, isActive: true },
        { isActive: false },
        { new: true },
    );
    if (!product) {
        return res.status(404).json({ error: "product not found" });
    }
    for (const image of product.images) {
        destroyImage(image.publicId);
    }
    res.status(204).end();
});

export default router;
