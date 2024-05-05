import ioredis from "ioredis";

let redisClient: ioredis | null = null;
/**
 * return redis client instance
 * @returns
 */
export function getRedisClient() {
  if (!redisClient) {
    redisClient = new ioredis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD
    });
    redisClient.on("connect", () => {
      console.log("Redis connected");
    });
  }
  return redisClient;
}
