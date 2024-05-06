import { config } from "../../config";
import { getRedisClient } from "../connections/redis";
import { logger } from "../modules/log/logger";

export async function memoize<T>({
  key,
  ttl,
  getResult
}: {
  /**
   * key to store the result
   */
  key: string;
  /**
   * time to live in seconds
   */
  ttl: number;
  getResult: (...args: unknown[]) => Promise<T>;
}): Promise<T> {
  const client = getRedisClient();
  const result = await client.get(key);
  if (result) {
    if (config.isDevEnvironment) logger.info("cache hit: " + key);
    return JSON.parse(result) as T;
  }
  if (config.isDevEnvironment) logger.info("cache miss: " + key);
  const newResult = await getResult(); // argument are passed to the function using bind
  await client.set(key, JSON.stringify(newResult), "EX", ttl);
  return newResult;
}
