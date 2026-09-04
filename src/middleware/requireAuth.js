import { randomBytes } from "crypto";

import jwt from "jsonwebtoken";

import ApiKey from "../models/ApiKey.js";

const JWT_EXPIRY = "1h";

export function signToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function newApiKey() {
    return `sk_${randomBytes(24).toString("hex")}`;
}

// Accepts either a JWT bearer token (browser/session login) or an
// x-api-key header (machine-to-machine), so one middleware covers both.
export async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = payload.sub;
            return next();
        } catch {
            return res.status(401).json({ error: "token invalid or expired" });
        }
    }

    const key = req.headers["x-api-key"];
    if (key) {
        const apiKey = await ApiKey.findOne({ key });
        if (!apiKey) {
            return res.status(401).json({ error: "invalid api key" });
        }
        req.userId = apiKey.userId;
        return next();
    }

    return res.status(401).json({ error: "not authenticated" });
}
