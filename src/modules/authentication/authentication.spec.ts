import {
  createJWTToken,
  createRefreshToken,
  hashPassword,
  verifyJWTToken,
  verifyPassword
} from "./authentication.service";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../../../config";

describe("Authentication", () => {
  describe("Hash Password and Verify Password", () => {
    beforeAll(() => {
      config.hash.salt = "salt_longer_than_16_characters";
      config.hash.secret = "secret_longer_than_16_characters";
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

  describe("JWT Token", () => {
    beforeAll(() => {
      // create a pair of private and public keys
      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem"
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem"
        }
      });
      config.jwt.privateKey = privateKey;
      config.jwt.publicKey = publicKey;
    });

    it("Should create a JWT token", async () => {
      const token = await createJWTToken({ username: "test" });
      expect(token).toBeDefined();
      // token expires
      const decoded = jwt.decode(token as string) as {
        username: string;
        type: string;
      };
      expect(decoded.username).toBe("test");
      expect(decoded.type).toBe("access_token");
      // verify token with public key
      const verified = await verifyJWTToken<{ username: string }>(
        token as string
      );
      expect(verified).toBeDefined();
      expect(verified?.username).toBe("test");
      expect(verified?.type).toBe("access_token");
    });

    it("Should return null when we verify a wrong token", async () => {
      const token = await createJWTToken({ username: "test" });
      expect(token).toBeDefined();
      // token expires
      const decoded = jwt.decode(token as string) as {
        username: string;
        type: string;
      };
      expect(decoded.username).toBe("test");
      expect(decoded.type).toBe("access_token");
      // verify token with public key
      const verified = await verifyJWTToken<{ username: string }>(
        "wrong_token"
      );
      expect(verified).toBeNull();
    });

    it("Should return null when we verify a expired token", async () => {
      const token = await createJWTToken({ username: "test" });
      // jest fake timers
      jest.useFakeTimers({
        now: Date.now()
      });
      jest.setSystemTime(Date.now() + 60 * 60 * 1000 + 1000);
      // token expires
      const result = await verifyJWTToken<{ username: string }>(
        token as string
      );
      expect(result).toBeNull();
      // reset timers
      jest.useRealTimers();
    });

    it("Should create a refresh token", async () => {
      const refreshToken = await createRefreshToken({ username: "test" });
      expect(refreshToken).toBeDefined();
      // token expires
      const decoded = jwt.decode(refreshToken as string) as {
        username: string;
        type: string;
      };
      expect(decoded.username).toBe("test");
      expect(decoded.type).toBe("refresh_token");
      // verify token with public key
      const verified = await verifyJWTToken<{ username: string }>(
        refreshToken as string
      );
      expect(verified).toBeDefined();
      expect(verified?.username).toBe("test");
      expect(verified?.type).toBe("refresh_token");
    });

    it("Should return null when we verify a expired refresh token", async () => {
      const refreshToken = await createRefreshToken({ username: "test" });
      // jest fake timers
      jest.useFakeTimers({
        now: Date.now()
      });
      jest.setSystemTime(Date.now() + 7 * 24 * 60 * 60 * 1000 + 1000);
      // token expires
      const result = await verifyJWTToken<{ username: string }>(
        refreshToken as string
      );
      expect(result).toBeNull();
      // reset timers
      jest.useRealTimers();
    });
  });
});
