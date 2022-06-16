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

describe("test booking", () => {
  describe("given an admin is logged in", () => {
    
    test("they can force a booking, which is automatically accepted if it is for an admin", async () => {
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          userId: String(adminId),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("accepted");
        });
    });
    test("they can force a booking, which is automatically modified if it is for another user", async () => {
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          userId: String(userId),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("modified");
        });
    });
    test("they can update a booking, which is automatically modified if it is for another user", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          details: "old details",
        })
        .expect(201)
        .then((res) => {
          bookingId = res.body._id;
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("pending");
        });
      await agent
        .put("/api/bookings/admin/" + bookingId)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          details: "new details",
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("modified");
          expect(res.body.details).toBe("new details");
        });
    });
    test("they can accept a booking, if it was last modified by a user", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
        })
        .expect(201)
        .then((res) => {
          bookingId = res.body._id;
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("pending");
        });
      await agent
        .post(`/api/bookings/${bookingId}/accept`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("accepted");
        });
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          userId: String(userId),
        })
        .expect(201)
        .then((res) => {
          bookingId = res.body._id;
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("modified");
        });
      await agent
        .post(`/api/bookings/${bookingId}/accept`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .expect(403)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("they can reject a booking, if it was last modified by a user", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
        })
        .expect(201)
        .then((res) => {
          bookingId = res.body._id;
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("pending");
        });
      await agent
        .post(`/api/bookings/admin/${bookingId}/reject`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("rejected");
        });
    });
    test("they can delete a booking", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          userId: String(userId),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("modified");
          bookingId = res.body._id;
        });
      await agent
        .delete("/api/bookings/admin/" + bookingId)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .expect(200);
    });
  });
  describe("given a user is logged in", () => {
    test("they can create a booking, set to pending", async () => {
      await agent
        .post("/api/bookings/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("pending");
        });
    });
    test("they can modify a booking, set to pending", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          details: "Wow some details",
          userId: String(userId),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("modified");
          bookingId = res.body._id;
        });
      await agent
        .put("/api/bookings/" + bookingId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          endDate: new Date(),
          details: "Wow some updated details",
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("pending");
          expect(res.body.details).toBe("Wow some updated details");
        });
    });
    test("they can view all their bookings", async () => {
      await agent
        .get("/api/bookings/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("they can accept a booking when it has been last modified by an admin", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          userId: String(userId),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("modified");
          bookingId = res.body._id;
        });
      await agent
        .post(`/api/bookings/${bookingId}/accept`)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("accepted");
        });
    });
    test("they cannot accept a booking when it has not been last modified by an admin", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("pending");
          bookingId = res.body._id;
        });
      await agent
        .post(`/api/bookings/${bookingId}/accept`)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(403)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("they cannot modify bookings of other users", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          details: "Wow some details",
          userId: String(adminId),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("accepted");
          bookingId = res.body._id;
        });
      await agent
        .put("/api/bookings/" + bookingId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          endDate: new Date(),
          details: "Wow some updated details",
        })
        .expect(400)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
    test("they can delete a booking, but not of other users", async () => {
      let bookingId;
      await agent
        .post("/api/bookings/admin")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
          details: "Wow some details",
          userId: String(adminId),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("accepted");
          bookingId = res.body._id;
        });
      await agent
        .delete("/api/bookings/" + bookingId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(400)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
      await agent
        .post("/api/bookings/")
        .set("Authorization", `Bearer ${userAuthToken}`)
        .send({
          startDate: new Date(),
          endDate: new Date(),
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toBeTruthy();
          expect(res.body.status).toBe("pending");
          bookingId = res.body._id;
        });
      await agent
        .delete("/api/bookings/" + bookingId)
        .set("Authorization", `Bearer ${userAuthToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });
});
