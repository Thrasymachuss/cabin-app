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

describe("test posts", () => {
  describe("given a user is logged in", () => {
    test("they can create, update, delete", async () => {
      let id;
      await agent
        .post("/api/posts/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          id = res.body._id;
        });
      await agent
        .put(`/api/posts/${id}`)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
      await agent
        .delete(`/api/posts/${id}`)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("they cannot update posts created by another user", async () => {
      let id;
      await agent
        .post("/api/posts/")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          id = res.body._id;
        });
      await agent
        .put(`/api/posts/${id}`)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(403)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
  describe("given an admin is logged in", () => {
    test("they can modify posts by other users", async () => {
      let id;
      await agent
        .post("/api/posts/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          id = res.body._id;
        });
      await agent
        .put(`/api/posts/${id}`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
});
