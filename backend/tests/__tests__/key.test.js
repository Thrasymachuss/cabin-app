const request = require("supertest");
const jwt = require("jsonwebtoken");
const createApp = require("../../app");
const db = require("../testdb");
const seedDb = require("../seed");

// Pass supertest agent for each test
const app = createApp();
const agent = request.agent(app);
let adminId;
let adminAuthToken;
let userId;
let userAuthToken;

// Setup connection to the database
beforeAll(async () => {
  await db.connect();
  const ids = await seedDb();
  [adminId, userId] = ids;
  adminAuthToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  userAuthToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
});

afterAll(async () => await db.close());

describe("test key", () => {
  describe("given a user is logged in", () => {
    test("they cannot create a key", async () => {
      await agent
        .post("/api/keys")
        .set("authorization", `Bearer ${userAuthToken}`)
        .expect(403);
    });
  });
  describe("given an admin is logged in", () => {
    test("they can create and delete keys", async () => {
      let keyId;
      await agent
        .post("/api/keys")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .expect(201)
        .then((res) => {
          keyId = res.body._id;
        });
      await agent
        .delete(`/api/keys/${keyId}`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .expect(200);
    });
  });
});
