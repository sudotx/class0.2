import User from "../models/User.js";

export async function requireAdmin(req, res, next) {
    const user = await User.findOne({ _id: req.userId }).active();
    if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "admin access required" });
    }
    next();
}
