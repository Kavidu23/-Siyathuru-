const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

const userRoutes = require('../../routes/userRoutes');
const eventsRoutes = require('../../routes/eventsRoutes');
const User = require('../../models/user');
const Event = require('../../models/events');

const createTestApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/users', userRoutes);
  app.use('/api/events', eventsRoutes);
  return app;
};

describe('Integration: Auth + Protected Events', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createTestApp();
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

  it('should complete register -> verify -> login -> me flow', async () => {
    const registerPayload = {
      name: 'Integration User',
      email: 'integration.user@test.com',
      pnumber: '94770000001',
      password: 'Password@123',
      role: 'member',
      age: 23,
      location: { coordinates: { latitude: 6.9, longitude: 79.8 } },
    };

    const registerRes = await request(app).post('/api/users').send(registerPayload);
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);

    const createdUser = await User.findOne({ email: registerPayload.email });
    expect(createdUser).toBeTruthy();
    expect(createdUser.isVerified).toBe(false);
    expect(createdUser.verificationCode).toBeTruthy();

    const verifyRes = await request(app).post('/api/users/verify').send({
      email: registerPayload.email,
      code: createdUser.verificationCode,
    });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toEqual({
      success: true,
      message: 'Account verified successfully',
    });

    const agent = request.agent(app);
    const loginRes = await agent.post('/api/users/login').send({
      email: registerPayload.email,
      password: registerPayload.password,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.user.email).toBe(registerPayload.email);
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const meRes = await agent.get('/api/users/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.name).toBe(registerPayload.name);
  });

  it('should enforce auth+role on event creation (401/403/201)', async () => {
    const eventPayload = {
      communityId: new mongoose.Types.ObjectId().toString(),
      title: 'Integration Event',
      description: 'Critical integration event path',
      location: 'Colombo',
      eventDate: '2026-03-01',
      eventTime: '10:00',
      attendees: [],
    };

    const noTokenRes = await request(app).post('/api/events').send(eventPayload);
    expect(noTokenRes.status).toBe(401);
    expect(noTokenRes.body).toEqual({ message: 'No token provided' });

    await request(app).post('/api/users').send({
      name: 'Member User',
      email: 'member@test.com',
      pnumber: '94770000002',
      password: 'Password@123',
      role: 'member',
    });
    const member = await User.findOne({ email: 'member@test.com' });
    await request(app).post('/api/users/verify').send({
      email: 'member@test.com',
      code: member.verificationCode,
    });

    const memberAgent = request.agent(app);
    await memberAgent.post('/api/users/login').send({
      email: 'member@test.com',
      password: 'Password@123',
    });

    const forbiddenRes = await memberAgent.post('/api/events').send(eventPayload);
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body).toEqual({ message: 'Access denied' });

    await request(app).post('/api/users').send({
      name: 'Leader User',
      email: 'leader@test.com',
      pnumber: '94770000003',
      password: 'Password@123',
      role: 'leader',
    });
    const leader = await User.findOne({ email: 'leader@test.com' });
    await request(app).post('/api/users/verify').send({
      email: 'leader@test.com',
      code: leader.verificationCode,
    });

    const leaderAgent = request.agent(app);
    await leaderAgent.post('/api/users/login').send({
      email: 'leader@test.com',
      password: 'Password@123',
    });

    const createRes = await leaderAgent.post('/api/events').send(eventPayload);
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.message).toBe('Event created successfully');

    const eventInDb = await Event.findOne({ title: 'Integration Event' });
    expect(eventInDb).toBeTruthy();
    expect(String(eventInDb.communityId)).toBe(eventPayload.communityId);
  });
});
