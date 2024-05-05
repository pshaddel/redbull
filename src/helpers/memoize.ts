import { getRedisClient } from "../connections/redis";

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
    console.log("Cache hit");
    return JSON.parse(result) as T;
  }
  console.log("Cache miss");
  const newResult = await getResult(); // argument are passed to the function using bind
  await client.set(key, JSON.stringify(newResult), "EX", ttl);
  return newResult;
}
