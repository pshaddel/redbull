import request from "supertest";
import { app } from "../../app";
import { connect } from "../../connections/db";
import { UserModel } from "./user.model";

describe("User Service", () => {
  beforeAll(async () => {
    const res = await connect();
    console.log("res:", res);
  });
  beforeEach(async () => {
    await UserModel.deleteMany();
  });
  describe("Add a User", () => {
    const endpoint = "/users";
    it("when we pass name and email we should be able to create a test user", async () => {
      //Act
      const result = await request(app).post(endpoint).send({
        name: "testUser",
        email: "testUser@email.com"
      });
      //Assert
      expect(result.body.name).toBe("testUser");
    });
    it("Should get Bad Request when we pass an invalid email", async () => {
      //Act
      const result = await request(app).post(endpoint).send({
        name: "testUser",
        email: "testUseremail.com"
      });
      //Assert
      expect(result.status).toBe(400);
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
