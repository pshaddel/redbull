import { getRedisClient } from "../connections/redis";
import ioredis from "ioredis";
import { memoize } from "./memoize";

describe("memoize", () => {
  let client: ioredis;

  beforeAll(() => {
    process.env.REDIS_HOST = "localhost";
    process.env.REDIS_PORT = "6379";
    process.env.REDIS_PASSWORD = "password123";
    client = getRedisClient();
  });
  beforeEach(async () => {
    await client.flushall();
  });
  afterAll(async () => {
    await client.flushall();
  });

  it("should return the cached result if it exists", async () => {
    const key = "testKey";
    const ttl = 60;
    const cachedResult = { data: "cached" };
    await client.set(key, JSON.stringify(cachedResult));

    const func = async (someValue: { data: string }) => {
      return Promise.resolve(someValue);
    };
    const result = await memoize({
      key,
      ttl,
      getResult: func.bind(null, cachedResult)
    });

    expect(result).toEqual(cachedResult);
  });

  it("should cache and return the result if it does not exist", async () => {
    const key = "testKey";
    const ttl = 60;
    const newResult = { data: "new" };

    const func = async (someValue: { data: string }) => {
      return Promise.resolve(someValue);
    };

    const result = await memoize({
      key,
      ttl,
      getResult: func.bind(null, newResult)
    });

    const cachedResult = JSON.parse((await client.get(key)) as string);
    expect(cachedResult).toEqual(newResult);
    expect(result).toEqual(newResult);
  });
});
