import cors from "cors";
import express, { json } from "express";
import { connect } from "mongoose";

import { configDotenv } from "dotenv";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import checkoutRouter, { paystackWebhookRaw, paystackWebhookHandler } from "./routes/checkout.js";
import ordersRouter from "./routes/orders.js";
import adminRouter from "./routes/admin.js";

configDotenv();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL?.split(",") ?? [], credentials: true }));

// Paystack webhook needs the raw request body to verify the signature, so it
// must be mounted before the global json() body parser.
app.post("/checkout/webhook", paystackWebhookRaw, paystackWebhookHandler);

app.use(json());

try {
  const conn = await connect(process.env.MONGO_URI);
  console.log(`mongodb connected @${conn.connection.host}`);
} catch (error) {
  console.error(error);
}

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);
app.use("/orders", ordersRouter);
app.use("/admin", adminRouter);

export default app;
