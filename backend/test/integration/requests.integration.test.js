const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../utils/sendEmail", () => jest.fn().mockResolvedValue(true));

const userRoutes = require("../../routes/userRoutes");
const requestsRoutes = require("../../routes/requestsRoutes");
const User = require("../../models/user");
const Community = require("../../models/communities");
const RequestModel = require("../../models/requests");

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/users", userRoutes);
  app.use("/api/requests", requestsRoutes);
  return app;
};

const registerVerifyLogin = async (app, userData) => {
  await request(app).post("/api/users").send(userData);
  const created = await User.findOne({ email: userData.email });
  await request(app).post("/api/users/verify").send({
    email: userData.email,
    code: created.verificationCode,
  });
  const agent = request.agent(app);
  await agent.post("/api/users/login").send({
    email: userData.email,
    password: userData.password,
  });
  return { agent, user: created };
};

describe("Integration: Requests", () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-jwt-secret";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createApp();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it("should enforce auth on requests routes", async () => {
    const res = await request(app).get("/api/requests");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  it("should perform create/read/update/delete request lifecycle", async () => {
    const { agent, user } = await registerVerifyLogin(app, {
      name: "Requests User",
      email: "requests.user@test.com",
      pnumber: "94770000601",
      password: "Password@123",
      role: "member",
    });

    const community = await Community.create({
      name: `Request Community ${Date.now()}`,
      type: "Youth Club",
      isPrivate: true,
    });

    const createRes = await agent.post("/api/requests").send({
      userId: String(user._id),
      communityId: String(community._id),
      status: "pending",
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.message).toBe("Request created successfully");

    const requestId = createRes.body.data._id;

    const listRes = await agent.get("/api/requests");
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.message).toBe("Requests fetched successfully");
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);

    const byIdRes = await agent.get(`/api/requests/${requestId}`);
    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body.success).toBe(true);
    expect(byIdRes.body.data._id).toBe(requestId);

    const updateRes = await agent
      .put(`/api/requests/${requestId}`)
      .send({ status: "approved" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.message).toBe("Request updated successfully");
    expect(updateRes.body.data.status).toBe("approved");

    const deleteRes = await agent.delete(`/api/requests/${requestId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({
      success: true,
      message: "Request deleted successfully",
    });

    const deleted = await RequestModel.findById(requestId);
    expect(deleted).toBeNull();
  });
});
