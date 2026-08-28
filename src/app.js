import express, { json } from "express";
import { connect } from "mongoose";

import { configDotenv } from "dotenv";
import usersRouter from "./routes/users.js";

configDotenv();

const app = express();

app.use(json());

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

export default app;
