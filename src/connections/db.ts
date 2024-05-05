import mongoose from "mongoose";
import { logger } from "../modules/log/logger";

export async function connect(): Promise<mongoose.Connection> {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === "dev")
      logger.info("Connecting to database...");
    mongoose.connect(
      (process.env as { DATABASE_URL: string }).DATABASE_URL,
      {}
    );
    mongoose.connection.on("error", (err) => {
      logger.error("Database connection error");
      reject(err);
    });
    mongoose.connection.on("disconnected", () => {
      logger.error("Database disconnected");
    });
    mongoose.connection.once("open", () => {
      if (process.env.NODE_ENV === "dev") logger.info("Database connected!");
      // return the connection
      resolve(mongoose.connection);
    });
  });
}
