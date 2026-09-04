import mongoose from "mongoose";
import app from "./app.js";

const port = process.env.PORT || 8000;

app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "error",
    db: dbConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
