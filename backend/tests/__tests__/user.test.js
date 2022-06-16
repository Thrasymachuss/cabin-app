const request = require("supertest");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const createApp = require("../../app");
const db = require("../testdb");
const seedDb = require("../seed");
const Key = require("../../models/keyModel");

// Pass supertest agent for each test
const app = createApp();
const agent = request.agent(app);
let id;
let authToken;

// Setup connection to the database
beforeAll(async () => {
  await db.connect();
  id = (await seedDb())[0];
  authToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
});

afterAll(async () => await db.close());

describe("test user routes", () => {
  describe("given a database exists", () => {
    it("should have an admin account to log into", async () => {
      await agent
        .post("/api/users/login")
        .send({ email: "admin@gmail.com", password: "1234" })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
  describe("given the admin is logged in", () => {
    test("that the admin can query all users", async () => {
      await agent
        .get("/api/users/all")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("that the admin can query their own info", async () => {
      await agent
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
  describe("given a user who is not logged in and enters an invalid key", () => {
    test("that they cannot register for an account", async () => {
      await agent
        .post("/api/users/register")
        .send({
          firstName: "New",
          lastName: "User",
          password: "12341234",
          email: "newuser@gmail.com",
          key: uuidv4(),
        })
        .expect(401)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
  describe("given a user who is not logged in but has a key", () => {
    test("that they can register for an account, and the key cannot be used again", async () => {
      const keyBody = uuidv4();
      await Key.create({
        body: keyBody,
      });
      await agent
        .post("/api/users/register")
        .send({
          firstName: "New",
          lastName: "User",
          password: "12341234",
          email: "newuser@gmail.com",
          key: keyBody,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
      await agent
        .post("/api/users/register")
        .send({
          firstName: "Extra New",
          lastName: "User",
          password: "12341234",
          email: "extranewuser@gmail.com",
          key: keyBody,
        })
        .expect(401)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
});
