import mongoose from "mongoose";
import { logger } from "../modules/log/logger";
import { config } from "../../config";

export async function connect(): Promise<mongoose.Connection> {
  return new Promise((resolve, reject) => {
    if (config.isDevEnvironment) logger.info("Connecting to database...");
    if (config.db.url == undefined) {
      logger.error("Database URL is not defined");
      reject("Database URL is not defined");
      return;
    }
    mongoose.connect(config.db.url, {});
    mongoose.connection.on("error", (err) => {
      logger.error("Database connection error");
      reject(err);
    });
    mongoose.connection.on("disconnected", () => {
      logger.error("Database disconnected");
    });
    mongoose.connection.once("open", () => {
      if (config.isDevEnvironment) logger.info("Database connected!");
      // return the connection
      resolve(mongoose.connection);
    });
  });
}
