import dotenv from "dotenv";
import { logger } from "./src/modules/log/logger";

export const getConfig = () => {
  logger.info("reading env file...");
  dotenv.config({ path: "./.env" });
  const { NODE_ENV, PORT } = process.env;
  if (!NODE_ENV) {
    throw new Error("NODE_ENV is not defined");
  }
  const conf = {
    port: PORT ? parseInt(PORT) : 3001,
    isTestEnvironment: NODE_ENV === "test",
    isDevEnvironment: NODE_ENV === "dev",
    isProdEnvironment: NODE_ENV === "production",
    jwt: {
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY
    },
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD
    },
    db: {
      url: process.env.DATABASE_URL
    },
    hash: {
      salt: process.env.HASH_SALT,
      secret: process.env.HASH_SECRET,
      testHash: process.env.TEST_ARGON_HASH
    },
    features: {
      rateLimiter: !!process.env.ENABLE_RATE_LIMITER
    },
    pixabay: {
      key: process.env.PIXABAY_KEY,
      baseURL: "https://pixabay.com/api/"
    }
  };
  return conf;
};

export const config = getConfig();
