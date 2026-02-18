const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../utils/sendEmail", () => jest.fn().mockResolvedValue(true));

const userRoutes = require("../../routes/userRoutes");
const communityRoutes = require("../../routes/communityRoutes");
const User = require("../../models/user");
const Community = require("../../models/communities");

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/users", userRoutes);
  app.use("/api/communities", communityRoutes);
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

describe("Integration: Communities", () => {
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

  it("should create a community with authenticated user and allow public reads", async () => {
    const { agent, user } = await registerVerifyLogin(app, {
      name: "Community Creator",
      email: "community.creator@test.com",
      pnumber: "94770000201",
      password: "Password@123",
      role: "leader",
    });

    const uniqueName = `Integration Community ${Date.now()}`;
    const createPayload = {
      name: uniqueName,
      type: "Youth Club",
      mission: "Integration mission",
      description: "Integration description",
      isPrivate: false,
    };

    const createRes = await agent.post("/api/communities").send(createPayload);
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.message).toBe("Community created successfully");
    expect(createRes.body.data.name).toBe(uniqueName);
    expect(String(createRes.body.data.leader)).toBe(String(user._id));

    const listRes = await request(app).get("/api/communities");
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);

    const createdId = createRes.body.data._id;
    const byIdRes = await request(app).get(`/api/communities/${createdId}`);
    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body.success).toBe(true);
    expect(byIdRes.body.data._id).toBe(createdId);
  });

  it("should enforce auth+admin role on community delete (401/403/200)", async () => {
    const { user: creator } = await registerVerifyLogin(app, {
      name: "Community Owner",
      email: "community.owner@test.com",
      pnumber: "94770000202",
      password: "Password@123",
      role: "leader",
    });

    const { agent: memberAgent } = await registerVerifyLogin(app, {
      name: "Community Member",
      email: "community.member@test.com",
      pnumber: "94770000203",
      password: "Password@123",
      role: "member",
    });

    const { agent: adminAgent } = await registerVerifyLogin(app, {
      name: "Community Admin",
      email: "community.admin@test.com",
      pnumber: "94770000204",
      password: "Password@123",
      role: "admin",
    });

    const community = await Community.create({
      name: `Delete Target ${Date.now()}`,
      type: "Charity",
      leader: creator._id,
      members: [creator._id],
      isPrivate: false,
    });

    const noTokenRes = await request(app).delete(`/api/communities/${community._id}`);
    expect(noTokenRes.status).toBe(401);
    expect(noTokenRes.body).toEqual({ message: "No token provided" });

    const forbiddenRes = await memberAgent.delete(`/api/communities/${community._id}`);
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body).toEqual({ message: "Access denied" });

    const adminDeleteRes = await adminAgent.delete(`/api/communities/${community._id}`);
    expect(adminDeleteRes.status).toBe(200);
    expect(adminDeleteRes.body).toEqual({
      success: true,
      message: "Community deleted successfully",
    });

    const deleted = await Community.findById(community._id);
    expect(deleted).toBeNull();
  });
});
