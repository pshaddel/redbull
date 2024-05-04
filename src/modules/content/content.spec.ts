import crypto from "crypto";
import { connect } from "../../connections/db";
import { UserModel } from "../user/user.model";
import request from "supertest";
import { app } from "../../app";
import { Content } from "./content.service";
const username = "poorshad@gmail.com";
const password = "testUser!123";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from "axios";
jest.mock("axios", () => ({
  get: async (url: string) => {
    if (url.includes("videos")) {
      return {
        data: {
          total: 462,
          totalHits: 462,
          hits: [
            {
              id: 24541,
              pageURL: "https://pixabay.com/videos/id-24541/",
              type: "film",
              tags: "summer, beach, sea",
              duration: 37,
              videos: {
                large: {
                  url: "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_large.mp4",
                  width: 1920,
                  height: 1080,
                  size: 26018022,
                  thumbnail:
                    "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_large.jpg"
                },
                medium: {
                  url: "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_medium.mp4",
                  width: 1280,
                  height: 720,
                  size: 13061200,
                  thumbnail:
                    "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_medium.jpg"
                },
                small: {
                  url: "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_small.mp4",
                  width: 960,
                  height: 540,
                  size: 6506387,
                  thumbnail:
                    "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_small.jpg"
                },
                tiny: {
                  url: "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_tiny.mp4",
                  width: 640,
                  height: 360,
                  size: 2244462,
                  thumbnail:
                    "https://cdn.pixabay.com/video/2019/06/19/24541-343454486_tiny.jpg"
                }
              },
              views: 359680,
              downloads: 177938,
              likes: 1250,
              comments: 227,
              user_id: 6346290,
              user: "FreeCreativeStuff",
              userImageURL:
                "https://cdn.pixabay.com/user/2018/05/06/12-55-05-329_250x250.jpg"
            }
          ]
        }
      };
    }
    return {
      data: {
        total: 27927,
        totalHits: 500,
        hits: [
          {
            id: 2785074,
            pageURL:
              "https://pixabay.com/photos/puppy-pet-canine-dog-animal-lying-2785074/",
            type: "photo",
            tags: "puppy, pet, canine",
            previewURL:
              "https://cdn.pixabay.com/photo/2017/09/25/13/12/puppy-2785074_150.jpg",
            previewWidth: 150,
            previewHeight: 99,
            webformatURL:
              "https://pixabay.com/get/g1d0ceee8c9991f676aa588a27077b216aa79d4d47f23aeef70d911bf2bf0632ced45b340fbd4b37f663b4365aad7618595f39f3405889a6fae5685593e633005_640.jpg",
            webformatWidth: 640,
            webformatHeight: 426,
            largeImageURL:
              "https://pixabay.com/get/g4ac1231862f36d4cfda7a18368343357fd30e3f7fa9967daba97d4f6f3075000d5c894037d133183662460d8fbd9e20fba9da46d53d30373f0f6b9589e5c4a5f_1280.jpg",
            imageWidth: 3943,
            imageHeight: 2628,
            imageSize: 2235576,
            views: 1181843,
            downloads: 795656,
            collections: 2016,
            likes: 1940,
            comments: 273,
            user_id: 6087762,
            user: "PicsbyFran",
            userImageURL:
              "https://cdn.pixabay.com/user/2023/10/02/08-59-47-205_250x250.jpg"
          }
        ]
      }
    };
  }
}));

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

describe("Content", () => {
  beforeAll(async () => {
    await connect();
  });
  beforeEach(async () => {
    await UserModel.deleteMany();
  });
  it("Should be able to get content data", async () => {
    // Arrange
    await request(app).post("/api/v1/users/register").send({
      password,
      username
    });
    const loginResult = await request(app).post("/api/v1/users/login").send({
      password,
      username
    });
    // Action
    const result = await request(app)
      .get("/api/v1/contents/image?query=cat&page=1")
      .set("Cookie", [`access_token=${loginResult.body.access_token};`]);
    // Assert
    expect(result.status).toBe(200);
    expect(result.body.total).toBeGreaterThan(0);
    expect(result.body.contents).toBeDefined();
    expect(result.body.contents.length).toBeGreaterThan(0);
    const content = result.body.contents[0] as Content;
    expect(content.id).toBeDefined();
    expect(content.type).toBe("image");
    expect(content.src).toBeDefined();
    expect(content.width).toBeDefined();
    expect(content.height).toBeDefined();
    expect(content.thumbnail).toBeDefined();
    expect(content.thumbnailWidth).toBeDefined();
    expect(content.thumbnailHeight).toBeDefined();
  });

  it("Should be able to get video content data", async () => {
    // Arrange
    await request(app).post("/api/v1/users/register").send({
      password,
      username
    });
    const loginResult = await request(app).post("/api/v1/users/login").send({
      password,
      username
    });
    // Action
    const result = await request(app)
      .get("/api/v1/contents/video?query=cat&page=1")
      .set("Cookie", [`access_token=${loginResult.body.access_token};`]);
    // Assert
    expect(result.status).toBe(200);
    expect(result.body.total).toBeGreaterThan(0);
    expect(result.body.contents).toBeDefined();
    expect(result.body.contents.length).toBeGreaterThan(0);
    const content = result.body.contents[0] as Content;
    expect(content.id).toBeDefined();
    expect(content.type).toBe("image");
    expect(content.src).toBeDefined();
    expect(content.width).toBeDefined();
    expect(content.height).toBeDefined();
    expect(content.thumbnail).toBeDefined();
    expect(content.thumbnailWidth).toBeDefined();
    expect(content.thumbnailHeight).toBeDefined();
  });

  it("Should return 400 if query is not provided", async () => {
    // Arrange
    await request(app).post("/api/v1/users/register").send({
      password,
      username
    });
    const loginResult = await request(app).post("/api/v1/users/login").send({
      password,
      username
    });
    // Action
    const imageResult = await request(app)
      .get("/api/v1/contents/image")
      .set("Cookie", [`access_token=${loginResult.body.access_token};`]);
    const videoResult = await request(app)
      .get("/api/v1/contents/video")
      .set("Cookie", [`access_token=${loginResult.body.access_token};`]);
    // Assert
    expect(imageResult.status).toBe(400);
    expect(videoResult.status).toBe(400);
  });

  it("Should get 401 if access token is not provided", async () => {
    // Arrange
    // Action
    const imageResult = await request(app).get(
      "/api/v1/contents/image?query=cat&page=1"
    );
    const videoResult = await request(app).get(
      "/api/v1/contents/video?query=cat&page=1"
    );
    // Assert
    expect(imageResult.status).toBe(401);
    expect(videoResult.status).toBe(401);
  });
});
