import { hashPassword, verifyPassword } from "./authentication.service";

describe("Authentication", () => {
  describe("Hash Password and Verify Password", () => {
    beforeAll(() => {
      process.env.HASH_SALT = "salt_longer_than_16_characters";
      process.env.HASH_SECRET = "secret_longer_than_16_characters";
    });
    it("Should hash and verify password", async () => {
      const password = "test";
      const { hash, error } = await hashPassword(password);
      expect(error).toBeNull();
      expect(hash).toBeDefined();
      expect(await verifyPassword(hash as string, password)).toBe(true);
    });

    it("Should return false when we verify a wrong password", async () => {
      const password = "test";
      const { hash, error } = await hashPassword(password);
      expect(error).toBeNull();
      expect(hash).toBeDefined();
      expect(await verifyPassword(hash as string, "wrongPassword")).toBe(false);
    });
  });
});
