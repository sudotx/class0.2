import jwt from "jsonwebtoken";

const MAX_CONCURRENT = 5;

// ponytail: in-memory Map, per-process only — move to Redis if the API ever runs on more than one instance
const inFlight = new Map();

function identify(req) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
        try {
            return `user:${jwt.verify(token, process.env.JWT_SECRET).sub}`;
        } catch {
            // fall through to IP
        }
    }
    return `ip:${req.ip}`;
}

export function concurrencyLimit(req, res, next) {
    const key = identify(req);
    const count = inFlight.get(key) ?? 0;

    if (count >= MAX_CONCURRENT) {
        return res.status(429).json({ error: "too many concurrent requests" });
    }

    inFlight.set(key, count + 1);
    // "close" fires on normal completion and on premature disconnects alike — no need for "finish" too
    res.on("close", () => release(key));

    next();
}

function release(key) {
    const count = inFlight.get(key) ?? 0;
    if (count <= 1) {
        inFlight.delete(key);
    } else {
        inFlight.set(key, count - 1);
    }
}
