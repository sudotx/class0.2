import express, { json } from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";

import { configDotenv } from "dotenv";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

configDotenv();

const app = express();

app.use(json());
app.use(cookieParser());
app.use(express.static("public"));

try {
  const conn = await connect(process.env.MONGO_URI);
  console.log(`mongodb connected @${conn.connection.host}`);
} catch (error) {
  console.error(error);
}

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", usersRouter);
app.use("/auth", authRouter);

export default app;
