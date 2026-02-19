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
const Community = require('../../models/communities');

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventsRoutes);
  return app;
};

const registerVerifyLogin = async (app, userData) => {
  await request(app).post('/api/users').send(userData);
  const created = await User.findOne({ email: userData.email });
  await request(app).post('/api/users/verify').send({
    email: userData.email,
    code: created.verificationCode,
  });
  const agent = request.agent(app);
  await agent.post('/api/users/login').send({
    email: userData.email,
    password: userData.password,
  });
  return { agent, user: created };
};

describe('Integration: Events', () => {
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

  it('should create/update/delete event as leader and block member create', async () => {
    const { agent: memberAgent } = await registerVerifyLogin(app, {
      name: 'Event Member',
      email: 'event.member@test.com',
      pnumber: '94770000401',
      password: 'Password@123',
      role: 'member',
    });

    const { agent: leaderAgent } = await registerVerifyLogin(app, {
      name: 'Event Leader',
      email: 'event.leader@test.com',
      pnumber: '94770000402',
      password: 'Password@123',
      role: 'leader',
    });

    const community = await Community.create({
      name: `Event Community ${Date.now()}`,
      type: 'Youth Club',
      isPrivate: false,
    });

    const payload = {
      communityId: String(community._id),
      title: 'Integration Event',
      description: 'Important event flow',
      location: 'Colombo',
      eventDate: '2026-03-10',
      eventTime: '14:00',
      attendees: [],
    };

    const forbiddenCreate = await memberAgent.post('/api/events').send(payload);
    expect(forbiddenCreate.status).toBe(403);
    expect(forbiddenCreate.body).toEqual({ message: 'Access denied' });

    const createRes = await leaderAgent.post('/api/events').send(payload);
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.message).toBe('Event created successfully');

    const eventId = createRes.body.data._id;
    const updateRes = await leaderAgent
      .put(`/api/events/${eventId}`)
      .send({ title: 'Integration Event Updated' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.title).toBe('Integration Event Updated');

    const deleteRes = await leaderAgent.delete(`/api/events/${eventId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.message).toBe('Event deleted successfully & notifications sent');

    const deleted = await Event.findById(eventId);
    expect(deleted).toBeNull();
  });

  it('should allow member to join event and prevent duplicate join', async () => {
    const { agent: memberAgent, user: memberUser } = await registerVerifyLogin(app, {
      name: 'Join Member',
      email: 'join.member@test.com',
      pnumber: '94770000403',
      password: 'Password@123',
      role: 'member',
    });

    const community = await Community.create({
      name: `Join Community ${Date.now()}`,
      type: 'Charity',
      isPrivate: false,
    });

    const event = await Event.create({
      communityId: community._id,
      title: 'Joinable Event',
      description: 'Member joins this event',
      location: 'Kandy',
      eventDate: new Date('2026-04-01'),
      eventTime: '09:00',
      attendees: [],
    });

    const joinRes = await memberAgent.post('/api/events/join').send({
      eventId: String(event._id),
      userId: String(memberUser._id),
    });
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.success).toBe(true);
    expect(joinRes.body.message).toBe('Joined event successfully');

    const joinedEvent = await Event.findById(event._id);
    expect(joinedEvent.attendees.map(String)).toContain(String(memberUser._id));

    const duplicateJoinRes = await memberAgent.post('/api/events/join').send({
      eventId: String(event._id),
      userId: String(memberUser._id),
    });
    expect(duplicateJoinRes.status).toBe(400);
    expect(duplicateJoinRes.body).toEqual({
      success: false,
      error: 'User already joined this event',
    });
  });

  it('should return public event list and event by id', async () => {
    const community = await Community.create({
      name: `Public Event Community ${Date.now()}`,
      type: 'Sports',
      isPrivate: false,
    });

    const event = await Event.create({
      communityId: community._id,
      title: 'Public Event',
      description: 'Visible to all',
      location: 'Galle',
      eventDate: new Date('2026-05-01'),
      eventTime: '16:00',
      attendees: [],
    });

    const listRes = await request(app).get('/api/events');
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);

    const byIdRes = await request(app).get(`/api/events/${event._id}`);
    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body.success).toBe(true);
    expect(byIdRes.body.data.title).toBe('Public Event');
  });
});
