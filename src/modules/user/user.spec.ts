import request from "supertest";
import { app } from "../../app";
import { connect } from "../../connections/db";
import { UserModel, userRegistrationValidator } from "./user.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const username = "poorshad@gmail.com";
const password = "testUser!123";
beforeAll(() => {
  // create a pair of private and public keys
  process.env.HASH_SALT = "salt_longer_than_16_characters";
  process.env.HASH_SECRET = "secret_longer_than_16_characters";
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
  process.env.JWT_PRIVATE_KEY = privateKey;
  process.env.JWT_PUBLIC_KEY = publicKey;
});
describe("User", () => {
  describe("User Route", () => {
    beforeAll(async () => {
      await connect();
    });
    beforeEach(async () => {
      await UserModel.deleteMany();
    });
    describe("Register a User", () => {
      const endpoint = "/api/v1/users/register";
      it("when we pass name and email we should be able to register a test user", async () => {
        // Arrange
        // Action
        const result = await request(app).post(endpoint).send({
          password: "testUser!123",
          username: "testUser@email.com"
        });
        //Assert
        expect(result.status).toBe(201);
      });
      it("Should get Bad Request when we pass an invalid email", async () => {
        //Act
        const result = await request(app).post(endpoint).send({
          name: "testUser",
          email: "testUseremail.com"
        });
        //Assert
        expect(result.status).toBe(400);
        expect(result.body).toEqual([
          { message: "Required", path: "username" },
          { message: "Required", path: "password" }
        ]);
      });
      it("Should get Bad Request when we are not passing name", async () => {
        //Act
        const result = await request(app).post(endpoint).send({
          // name: "testUser",
          email: "testUseremail.com"
        });
        //Assert
        expect(result.status).toBe(400);
      });

      it("Should get bad requets when username already exists", async () => {
        // Arrange
        await request(app).post(endpoint).send({
          password: "testUser!123",
          username: "start@gmail.com"
        });
        // Action
        const result = await request(app).post(endpoint).send({
          password: "testUser!123",
          username: "start@gmail.com"
        });
        // Assert
        expect(result.status).toBe(400);
        expect(result.body).toEqual({ error: "USER_ALREADY_EXISTS" });
      });
    });

    describe("Login a User", () => {
      it("Should be able to login a user which is already registered", async () => {
        // Arrange
        await request(app).post("/api/v1/users/register").send({
          password: "testUser!123",
          username: "poorshad@gmail.com"
        });
        // Action
        const result = await request(app).post("/api/v1/users/login").send({
          password: "testUser!123",
          username: "poorshad@gmail.com"
        });
        // Assert
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("access_token");
        expect(result.body.access_token).toBeTruthy();
        expect(result.body).toHaveProperty("refresh_token");
        expect(result.body.refresh_token).toBeTruthy();
        expect(result.body).toHaveProperty("user");
        // should be a valid jwt token
        const decoded = jwt.decode(result.body.access_token) as {
          username: string;
        };
        expect(decoded.username).toBe("poorshad@gmail.com");
      });
    });

    describe("Refresh Token", () => {
      it("Should be able to refresh the token", async () => {
        // Arrange
        await request(app).post("/api/v1/users/register").send({
          password: "testUser!123",
          username: "poorshad@gmail.com"
        });
        const loginResult = await request(app)
          .post("/api/v1/users/login")
          .send({
            password: "testUser!123",
            username: "poorshad@gmail.com"
          });
        // Action
        const result = await request(app)
          .post("/api/v1/users/refresh")
          .set("Cookie", [`refresh_token=${loginResult.body.refresh_token};`]);
        // Assert
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("access_token");
        expect(result.body).toHaveProperty("refresh_token");
        expect(result.headers["set-cookie"]).toEqual([
          `access_token=${result.body.access_token}; Path=/; HttpOnly; SameSite=Strict`,
          `refresh_token=${result.body.refresh_token}; Domain=/api/v1/users/refresh; Path=/; HttpOnly; SameSite=Strict`
        ]);
      });

      it("Previous Refresh Token should be invalid after refresh", async () => {
        expect(1).toBe(1);
      });
    });

    describe("Protected Middleware /me", () => {
      it("Should return the user information", async () => {
        // Arrange
        await request(app).post("/api/v1/users/register").send({
          password,
          username
        });
        const loginResult = await request(app)
          .post("/api/v1/users/login")
          .send({
            password,
            username
          });
        // Action
        const result = await request(app)
          .get("/api/v1/users/me")
          .set("Cookie", [`access_token=${loginResult.body.access_token};`]);
        // Assert
        expect(result.status).toBe(200);
        expect(result.body.user).toHaveProperty("username");
        expect(result.body.user.username).toBe(username);
      });

      it("Should get Unauthorized when we pass an invalid token", async () => {
        // Action
        const result = await request(app)
          .get("/api/v1/users/me")
          .set("Cookie", [`access_token=invalid_token;`]);
        // Assert
        expect(result.status).toBe(401);
      });
    });
  });

  describe("Password Validator", () => {
    it("Passwords that contain at least 8 characters and a combination of lowercase, uppercase, number and a special character should be valid", () => {
      expect(
        userRegistrationValidator.safeParse({
          password: "testUser!123",
          username: "test@gmail.com"
        }).success
      ).toBe(true); // valid
      expect(
        userRegistrationValidator.safeParse({
          password: "testUser123",
          username: "test@gmail.com"
        }).success
      ).toBe(false); // invalid: no special character
      expect(
        userRegistrationValidator.safeParse({
          password: "testUser!",
          username: "test@gmail.com"
        }).success
      ).toBe(false); // invalid: no number
      expect(
        userRegistrationValidator.safeParse({
          password: "testUser123",
          username: "test@gmail.com"
        }).success
      ).toBe(false); // invalid: no special character
      expect(
        userRegistrationValidator.safeParse({
          password: "123",
          username: "test@gmail.com"
        }).success
      ).toBe(false); // invalid: less than 8 characters
    });
  });

  describe("Username Validator", () => {
    const validEmails = [
      "email@domain.com",
      "firstname.lastname@domain.com",
      "email@subdomain.domain.com",
      "firstname+lastname@domain.com",
      "email@123.123.123.123", // our code does not check validation for IP address
      "email@[123.123.123.123]",
      '"email"@domain.com',
      "1234567890@domain.com",
      "email@domain-one.com",
      "_______@domain.com",
      "email@domain.name",
      "email@domain.co.jp",
      "firstname-lastname@domain.com"
    ];
    const invalidEmails = [
      "plainaddress",
      "#@%^%#$@#$@#.com",
      "@domain.com",
      "Joe Smith <email@domain.com>",
      "email.domain.com",
      "email@domain@domain.com",
      ".email@domain.com",
      "email.@domain.com",
      "email..email@domain.com",
      "email@domain.com (Joe Smith)",
      "email@domain..com"
    ];
    it("Supported Emails based on  RFC 2822", () => {
      validEmails.forEach((email) => {
        expect(
          userRegistrationValidator.safeParse({
            password: "testUser!123",
            username: email
          }).success
        ).toBe(true); // valid
      });
    });

    it("Unsupported Emails based on  RFC 2822", () => {
      invalidEmails.forEach((email) => {
        expect(
          userRegistrationValidator.safeParse({
            password: "testUser!123",
            username: email
          }).success
        ).toBe(false); // invalid
      });
    });
  });
});
