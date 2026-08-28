import { randomBytes } from "crypto";

import { Router } from "express";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { signToken } from "../middleware/requireAuth.js";

const router = Router();
const oauthClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);
const STATE_COOKIE_OPTS = { httpOnly: true, sameSite: "lax", maxAge: 5 * 60 * 1000 };

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

        res.redirect(`/#token=${signToken(user._id)}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "oauth login failed" });
    }
});

export default router;
