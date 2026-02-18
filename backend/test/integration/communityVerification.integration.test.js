const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../utils/sendEmail", () => jest.fn().mockResolvedValue(true));

const userRoutes = require("../../routes/userRoutes");
const communityVerificationRoutes = require("../../routes/communityVerficationRouter");
const User = require("../../models/user");
const Community = require("../../models/communities");

const codesFilePath = path.join(
  __dirname,
  "../../data/communityVerificationCodes.json"
);

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/users", userRoutes);
  app.use("/api/community-verification", communityVerificationRoutes);
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

describe("Integration: Community Verification", () => {
  let mongoServer;
  let app;
  let originalCodesFile = "[]";

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-jwt-secret";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createApp();
    originalCodesFile = await fs.readFile(codesFilePath, "utf8");
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
    await fs.writeFile(codesFilePath, "[]", "utf8");
  });

  afterAll(async () => {
    await fs.writeFile(codesFilePath, originalCodesFile, "utf8");
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it("should enforce auth and leader role on request endpoint (401/403/200)", async () => {
    const community = await Community.create({
      name: `Verification Target ${Date.now()}`,
      type: "Youth Club",
      isPrivate: false,
      isVerified: false,
    });

    const code = 123456;
    await fs.writeFile(
      codesFilePath,
      JSON.stringify(
        [
          {
            communityId: String(community._id),
            registrationCode: code,
            usage: "Not used",
          },
        ],
        null,
        2
      ),
      "utf8"
    );

    const noTokenRes = await request(app)
      .post("/api/community-verification/request")
      .send({ communityId: String(community._id), registrationCode: code });
    expect(noTokenRes.status).toBe(401);
    expect(noTokenRes.body).toEqual({ message: "No token provided" });

    const { agent: memberAgent } = await registerVerifyLogin(app, {
      name: "Verification Member",
      email: "verification.member@test.com",
      pnumber: "94770000301",
      password: "Password@123",
      role: "member",
    });

    const forbiddenRes = await memberAgent
      .post("/api/community-verification/request")
      .send({ communityId: String(community._id), registrationCode: code });
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body).toEqual({ message: "Access denied" });

    const { agent: leaderAgent } = await registerVerifyLogin(app, {
      name: "Verification Leader",
      email: "verification.leader@test.com",
      pnumber: "94770000302",
      password: "Password@123",
      role: "leader",
    });

    const okRes = await leaderAgent
      .post("/api/community-verification/request")
      .send({ communityId: String(community._id), registrationCode: code });
    expect(okRes.status).toBe(200);
    expect(okRes.body).toEqual({
      success: true,
      message: "Verification code is valid",
      data: {
        communityId: String(community._id),
        usage: "Not used",
      },
    });
  });

  it("should verify community and mark registration code as used", async () => {
    const { agent: leaderAgent } = await registerVerifyLogin(app, {
      name: "Verifier Leader",
      email: "verifier.leader@test.com",
      pnumber: "94770000303",
      password: "Password@123",
      role: "leader",
    });

    const community = await Community.create({
      name: `Verification Success ${Date.now()}`,
      type: "Charity",
      isPrivate: false,
      isVerified: false,
    });

    const code = 654321;
    await fs.writeFile(
      codesFilePath,
      JSON.stringify(
        [
          {
            communityId: String(community._id),
            registrationCode: code,
            usage: "Not used",
          },
        ],
        null,
        2
      ),
      "utf8"
    );

    const verifyRes = await leaderAgent
      .post("/api/community-verification/verify")
      .send({
        communityId: String(community._id),
        registrationCode: code,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toEqual({
      success: true,
      message: "Community verified successfully",
      data: { communityId: String(community._id), isVerified: true },
    });

    const communityInDb = await Community.findById(community._id);
    expect(communityInDb.isVerified).toBe(true);

    const fileRaw = await fs.readFile(codesFilePath, "utf8");
    const fileData = JSON.parse(fileRaw);
    expect(fileData[0].usage).toBe("Used");
  });
});
