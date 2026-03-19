const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../../utils/sendEmail', () => jest.fn().mockResolvedValue(true));
const sendEmail = require('../../utils/sendEmail');

const userRoutes = require('../../routes/userRoutes');
const User = require('../../models/user');

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/users', userRoutes);
  return app;
};

describe('Integration: Users', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.FRONTEND_URL = 'http://localhost:4200';
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createApp();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it('should complete register -> verify -> login -> me -> logout flow', async () => {
    const payload = {
      name: 'User Integration',
      email: 'users.integration@test.com',
      pnumber: '94770000701',
      password: 'Password@123',
      role: 'member',
      age: 25,
      location: { coordinates: { latitude: 6.9, longitude: 79.8 } },
    };

    const registerRes = await request(app).post('/api/users').send(payload);
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);

    const created = await User.findOne({ email: payload.email });
    expect(created).toBeTruthy();
    expect(created.isVerified).toBe(false);
    expect(created.verificationCode).toBeTruthy();

    const verifyRes = await request(app).post('/api/users/verify').send({
      email: payload.email,
      code: created.verificationCode,
    });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toEqual({
      success: true,
      message: 'Account verified successfully',
    });

    const agent = request.agent(app);
    const loginRes = await agent.post('/api/users/login').send({
      email: payload.email,
      password: payload.password,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const meRes = await agent.get('/api/users/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.name).toBe(payload.name);
    expect(meRes.body.user.email).toBe(payload.email);
    expect(meRes.body.user.pnumber).toBe(payload.pnumber);
    expect(meRes.body.user.age).toBe(payload.age);
    expect(meRes.body.user.location).toEqual(payload.location);

    const logoutRes = await agent.post('/api/users/logout').send({});
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toEqual({
      success: true,
      message: 'Logged out successfully',
    });
  });

  it('should reject login for unverified user', async () => {
    const payload = {
      name: 'Unverified User',
      email: 'users.unverified@test.com',
      pnumber: '94770000702',
      password: 'Password@123',
      role: 'member',
    };

    await request(app).post('/api/users').send(payload);

    const loginRes = await request(app).post('/api/users/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body).toEqual({
      success: false,
      error: 'Account not verified',
    });
  });

  it('should perform forgot-password -> reset-password flow', async () => {
    const payload = {
      name: 'Reset User',
      email: 'users.reset@test.com',
      pnumber: '94770000703',
      password: 'OldPassword@123',
      role: 'member',
    };

    await request(app).post('/api/users').send(payload);
    const created = await User.findOne({ email: payload.email });

    await request(app).post('/api/users/verify').send({
      email: payload.email,
      code: created.verificationCode,
    });
    sendEmail.mockClear();

    const forgotRes = await request(app)
      .post('/api/users/forgot-password')
      .send({ email: payload.email });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const textBody = sendEmail.mock.calls[0][2] || '';
    const tokenMatch = textBody.match(/token=([a-f0-9]+)/i);
    expect(tokenMatch).toBeTruthy();
    const resetToken = tokenMatch[1];

    const resetRes = await request(app)
      .post('/api/users/reset-password')
      .send({ token: resetToken, password: 'NewPassword@123' });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body).toEqual({
      success: true,
      message: 'Password reset successful. You can now log in.',
    });

    const loginRes = await request(app).post('/api/users/login').send({
      email: payload.email,
      password: 'NewPassword@123',
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });
});
