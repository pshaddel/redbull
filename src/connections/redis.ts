import ioredis from "ioredis";
import { logger } from "../modules/log/logger";
import { config } from "../../config";

let redisClient: ioredis | null = null;
/**
 * return redis client instance
 * @returns
 */
export function getRedisClient() {
  if (!redisClient) {
    redisClient = new ioredis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password
    });
    redisClient.on("connect", () => {
      logger.info("Redis connected!");
    });
    redisClient.on("error", (error) => {
      logger.error("Redis connection error", error);
    });
  }
  return redisClient;
}
