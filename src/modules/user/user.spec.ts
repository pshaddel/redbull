import request from "supertest";
import { app } from "../../app";
import { connect } from "../../connections/db";
import { UserModel, userRegistrationValidator } from "./user.model";

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
