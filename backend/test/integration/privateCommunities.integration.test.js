const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../utils/sendEmail", () => jest.fn().mockResolvedValue(true));

const userRoutes = require("../../routes/userRoutes");
const privateCommunityRoutes = require("../../routes/privateCommunityRoutes");
const User = require("../../models/user");
const Community = require("../../models/communities");

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/users", userRoutes);
  app.use("/api/private-communities", privateCommunityRoutes);
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

describe("Integration: Private Communities", () => {
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

  it("should enforce auth+member role on join request endpoint (401/403/200)", async () => {
    const { agent: leaderAgent, user: leaderUser } = await registerVerifyLogin(app, {
      name: "PC Leader",
      email: "pc.leader@test.com",
      pnumber: "94770000501",
      password: "Password@123",
      role: "leader",
    });

    const { agent: memberAgent, user: memberUser } = await registerVerifyLogin(app, {
      name: "PC Member",
      email: "pc.member@test.com",
      pnumber: "94770000502",
      password: "Password@123",
      role: "member",
    });

    const community = await Community.create({
      name: `Private Community ${Date.now()}`,
      type: "Youth Club",
      isPrivate: true,
      leader: leaderUser._id,
      members: [],
      joinRequests: [],
    });

    const noTokenRes = await request(app).post(
      `/api/private-communities/${community._id}/join`
    );
    expect(noTokenRes.status).toBe(401);
    expect(noTokenRes.body).toEqual({ message: "No token provided" });

    const forbiddenRes = await leaderAgent.post(
      `/api/private-communities/${community._id}/join`
    );
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body).toEqual({ message: "Access denied" });

    const requestRes = await memberAgent.post(
      `/api/private-communities/${community._id}/join`
    );
    expect(requestRes.status).toBe(200);
    expect(requestRes.body).toEqual({
      success: true,
      message: "Join request sent. Awaiting approval.",
    });

    const communityInDb = await Community.findById(community._id);
    expect(communityInDb.joinRequests.map((r) => String(r.user))).toContain(
      String(memberUser._id)
    );
  });

  it("should allow leader to view and approve join request, updating community and user", async () => {
    const { agent: leaderAgent, user: leaderUser } = await registerVerifyLogin(app, {
      name: "PC Leader 2",
      email: "pc.leader2@test.com",
      pnumber: "94770000503",
      password: "Password@123",
      role: "leader",
    });

    const { user: memberUser } = await registerVerifyLogin(app, {
      name: "PC Member 2",
      email: "pc.member2@test.com",
      pnumber: "94770000504",
      password: "Password@123",
      role: "member",
    });

    const community = await Community.create({
      name: `Private Community 2 ${Date.now()}`,
      type: "Charity",
      isPrivate: true,
      leader: leaderUser._id,
      members: [],
      joinRequests: [{ user: memberUser._id }],
    });

    const requestsRes = await leaderAgent.get(
      `/api/private-communities/${community._id}/requests`
    );
    expect(requestsRes.status).toBe(200);
    expect(requestsRes.body.success).toBe(true);
    expect(requestsRes.body.joinRequests.length).toBe(1);
    expect(String(requestsRes.body.joinRequests[0].user._id)).toBe(
      String(memberUser._id)
    );

    const approveRes = await leaderAgent
      .post(`/api/private-communities/${community._id}/requests/handle`)
      .send({
        userId: String(memberUser._id),
        approve: true,
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body).toEqual({
      success: true,
      message: "Join request approved",
    });

    const updatedCommunity = await Community.findById(community._id);
    expect(updatedCommunity.members.map(String)).toContain(String(memberUser._id));
    expect(updatedCommunity.joinRequests.map((r) => String(r.user))).not.toContain(
      String(memberUser._id)
    );

    const updatedUser = await User.findById(memberUser._id);
    expect(updatedUser.joinedCommunities.map(String)).toContain(
      String(community._id)
    );
  });
});
