import jwt from "jsonwebtoken";

const JWT_EXPIRY = "1h";

export function signToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: "not authenticated" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.sub;
        next();
    } catch {
        return res.status(401).json({ error: "token invalid or expired" });
    }
}
