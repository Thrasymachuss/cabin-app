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

describe("test projects", () => {
  describe("given that the admin is logged in", () => {
    test("they should be able to create, delete, and update projects", async () => {
      let id;
      await agent
        .post("/api/projects/")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          title: "sample title",
          description: "sample description",
          budget: 10,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          id = res.body.id;
        });
      await agent
        .put(`/api/projects/${id}`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          title: "sample title",
          description: "sample description",
          budget: 10,
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
      await agent
        .delete(`/api/projects/${id}`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
  describe("given a regular user is logged in", () => {
    test("they should not be able to create projects", async () => {
      await agent
        .post("/api/projects/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          title: "sample title",
          description: "sample description",
          budget: 10,
        })
        .expect(403)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
});
