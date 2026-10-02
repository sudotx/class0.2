import "dotenv/config";
import { connect, disconnect } from "mongoose";

import User from "../src/models/User.js";

await connect(process.env.MONGO_URI);
const { deletedCount } = await User.deleteMany({ username: /^loadtest\d+$/ });
console.log(`removed ${deletedCount} load-test users`);
await disconnect();
