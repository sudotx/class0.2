import "dotenv/config";
import { connect, disconnect } from "mongoose";
import bcrypt from "bcrypt";

import User from "../src/models/User.js";

const POOL_SIZE = 50;
const PASSWORD = "loadtest123!";

await connect(process.env.MONGO_URI);
const hashed = await bcrypt.hash(PASSWORD, 10);

for (let i = 0; i < POOL_SIZE; i++) {
    const username = `loadtest${i}`;
    await User.findOneAndUpdate(
        { username },
        { username, email: `${username}@example.test`, password: hashed, role: "user" },
        { upsert: true },
    );
}

console.log(`seeded ${POOL_SIZE} load-test users (loadtest0..loadtest${POOL_SIZE - 1}, password: ${PASSWORD})`);
await disconnect();
