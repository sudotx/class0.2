import { randomBytes } from "crypto";

import ApiKey from "../models/ApiKey.js";

export function newApiKey() {
    return `sk_${randomBytes(24).toString("hex")}`;
}

export async function requireAuth(req, res, next) {
    const key = req.headers["x-api-key"];
    if (!key) {
        return res.status(401).json({ error: "not authenticated" });
    }

    const apiKey = await ApiKey.findOne({ key });
    if (!apiKey) {
        return res.status(401).json({ error: "invalid api key" });
    }

    req.userId = apiKey.userId;
    next();
}
