import { randomBytes } from "crypto";

import { Router } from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js";
import { signToken, newApiKey } from "../middleware/requireAuth.js";

const router = Router();
const oauthClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);
const STATE_COOKIE_OPTS = { httpOnly: true, sameSite: "lax", maxAge: 5 * 60 * 1000 };

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
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    res.json({ status: "logged in", token: signToken(user._id) });
});

// Machine-to-machine: authenticate once with username/password to mint an
// API key, then use that key (x-api-key header) for every subsequent call.
router.post("/api-keys", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }

    const user = await User.findOne({ username }).active();
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    const apiKey = await ApiKey.create({ key: newApiKey(), userId: user._id });
    res.status(201).json({ status: "api key issued", apiKey: apiKey.key });
});

router.get("/google", (req, res) => {
    const state = randomBytes(16).toString("hex");
    res.cookie("oauthState", state, STATE_COOKIE_OPTS);

    const url = oauthClient.generateAuthUrl({
        scope: ["openid", "email", "profile"],
        state,
        prompt: "select_account",
    });
    res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state || state !== req.cookies?.oauthState) {
        return res.status(400).json({ error: "invalid oauth state" });
    }
    res.clearCookie("oauthState", STATE_COOKIE_OPTS);

    try {
        const { tokens } = await oauthClient.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        });
        const ticket = await oauthClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { sub, email, name } = ticket.getPayload();

        const user = await User.findOneAndUpdate(
            { googleId: sub },
            { googleId: sub, email, username: name || email },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        res.redirect(`${process.env.FRONTEND_URL?.split(",")[0] ?? ""}/oauth/callback#token=${signToken(user._id)}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "oauth login failed" });
    }
});

export default router;
