const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

const userRoutes = require('../../routes/userRoutes');
const alertRoutes = require('../../routes/alertRoutes');

const User = require('../../models/user');
const Community = require('../../models/communities');
const Alert = require('../../models/alert');

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/users', userRoutes);
  app.use('/api/alerts', alertRoutes);
  return app;
};

const registerVerifyLogin = async (app, userData) => {
  await request(app).post('/api/users').send(userData);
  const created = await User.findOne({ email: userData.email });
  await request(app).post('/api/users/verify').send({
    email: userData.email,
    code: created.verificationCode,
  });
  const agent = request.agent(app); //👉 agent keeps cookies between requests.
  await agent.post('/api/users/login').send({
    email: userData.email,
    password: userData.password,
  });
  return { agent, user: created };
};

describe('Integration: Alerts', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
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

  it('should enforce auth+role on alert creation (401/403/201)', async () => {
    const { user: memberUser, agent: memberAgent } = await registerVerifyLogin(app, {
      name: 'Member Alert User',
      email: 'member.alert@test.com',
      pnumber: '94770000101',
      password: 'Password@123',
      role: 'member',
    });

    const { agent: leaderAgent } = await registerVerifyLogin(app, {
      name: 'Leader Alert User',
      email: 'leader.alert@test.com',
      pnumber: '94770000102',
      password: 'Password@123',
      role: 'leader',
    });

    const community = await Community.create({
      name: 'Alert Community',
      type: 'Youth Club',
      leader: memberUser._id,
      members: [memberUser._id],
      isPrivate: false,
    });

    const payload = {
      communityId: community._id.toString(),
      title: 'Important Update',
      message: 'System maintenance tonight',
      severity: 'warning',
      isActive: true,
    };

    const noTokenRes = await request(app).post('/api/alerts').send(payload);
    expect(noTokenRes.status).toBe(401);
    expect(noTokenRes.body).toEqual({ message: 'No token provided' });

    const forbiddenRes = await memberAgent.post('/api/alerts').send(payload);
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body).toEqual({ message: 'Access denied' });

    const createRes = await leaderAgent.post('/api/alerts').send(payload);
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.message).toBe('Alert created successfully');
    expect(createRes.body.data.title).toBe('Important Update');

    const alertInDb = await Alert.findOne({ title: 'Important Update' });
    expect(alertInDb).toBeTruthy();
    expect(String(alertInDb.communityId)).toBe(payload.communityId);
  });

  it('should allow member to read alerts and leader to delete alert', async () => {
    const { user: memberUser, agent: memberAgent } = await registerVerifyLogin(app, {
      name: 'Member Read User',
      email: 'member.read@test.com',
      pnumber: '94770000103',
      password: 'Password@123',
      role: 'member',
    });

    const { agent: leaderAgent } = await registerVerifyLogin(app, {
      name: 'Leader Delete User',
      email: 'leader.delete@test.com',
      pnumber: '94770000104',
      password: 'Password@123',
      role: 'leader',
    });

    const community = await Community.create({
      name: 'Alert Community 2',
      type: 'Charity',
      leader: memberUser._id,
      members: [memberUser._id],
      isPrivate: false,
    });

    const created = await Alert.create({
      communityId: community._id,
      title: 'Read/Delete Alert',
      message: 'Read and delete flow',
      severity: 'info',
      isActive: true,
    });

    const listRes = await memberAgent.get('/api/alerts');
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].title).toBe('Read/Delete Alert');

    const deleteRes = await leaderAgent.delete(`/api/alerts/${created._id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({
      success: true,
      message: 'Alert deleted successfully',
    });

    const deleted = await Alert.findById(created._id);
    expect(deleted).toBeNull();
  });
});
