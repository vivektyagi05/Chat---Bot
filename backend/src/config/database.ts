import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../logger/logger.js";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection failed", { error: err });
    process.exit(1);
  }
  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}
