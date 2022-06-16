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

describe("test comment", () => {
  describe("given a user is logged in", () => {
    test("they can create, update, delete", async () => {
      let postId;
      let commentId;
      await agent
        .post("/api/posts/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          postId = res.body._id;
        });
      await agent
        .post("/api/comments/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
          postId,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          commentId = res.body._id;
        });
      await agent
        .put("/api/comments/" + commentId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
          postId,
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
      await agent
        .delete("/api/comments/" + commentId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("they cannot edit comments of other users", async () => {
      let postId;
      let commentId;
      await agent
        .post("/api/posts/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          postId = res.body._id;
        });
      await agent
        .post("/api/comments/")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          text: "some text",
          postId,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          commentId = res.body._id;
        });
      await agent
        .put("/api/comments/" + commentId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
          postId,
        })
        .expect(403)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("they cannot create a comment without a valid post id", async () => {
      await agent
        .post("/api/comments/")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          text: "some text",
          postId: "1234",
        })
        .expect(400)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
  describe("given an admin is logged in", () => {
    test("they can update comments of other users", async () => {
      let postId;
      let commentId;
      await agent
        .post("/api/posts/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          postId = res.body._id;
        });
      await agent
        .post("/api/comments/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
          postId,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          commentId = res.body._id;
        });
      await agent
        .put("/api/comments/" + commentId)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          text: "some text",
          postId,
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
  describe("given a user deletes a post", () => {
    it("should also delete any associated comments", async () => {
      let postId;
      let commentId;
      await agent
        .post("/api/posts/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          postId = res.body._id;
        });
      await agent
        .post("/api/comments/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          text: "some text",
          postId,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          commentId = res.body._id;
        });
      await agent
        .delete("/api/posts/" + postId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(200);
      await agent
        .get("/api/comments/bypost/" + postId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.length).toBe(0);
        });
    });
  });
});
