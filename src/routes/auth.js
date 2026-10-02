import { randomBytes } from "crypto";

import { Router } from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { signToken } from "../middleware/requireAuth.js";
import { notifyAdmin } from "../utils/telegram.js";
import { sendWelcomeEmail } from "../utils/email.js";

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
    notifyAdmin(`👤 New user: <b>${user.username}</b> (${user.email})`);
    sendWelcomeEmail(user.email, user.username);
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
  const header = req.headers.authorization ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", 'Basic realm="login"');
    return res.status(401).json({ error: "basic auth credentials required" });
  }

  const [username, password] = Buffer.from(encoded, "base64").toString().split(":");
  if (!username || !password) {
    res.set("WWW-Authenticate", 'Basic realm="login"');
    return res.status(401).json({ error: "invalid basic auth credentials" });
  }

  const user = await User.findOne({ username }).active();
  if (!user?.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  res.json({ status: "logged in", token: signToken(user._id) });
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
    const { sub, email } = ticket.getPayload();
    const frontend = process.env.FRONTEND_URL?.split(",")[0] ?? "";

    // Google sign-in authenticates existing accounts only — it does not register.
    const user = await User.findOne({
      $or: [{ googleId: sub }, { email: email?.toLowerCase() }],
    }).active();
    if (!user) {
      return res.redirect(`${frontend}/login#error=no_account`);
    }

    // Link the Google identity to a pre-existing password account on first use.
    if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }

    res.redirect(`${frontend}/oauth/callback#token=${signToken(user._id)}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "oauth login failed" });
  }
});

export default router;
