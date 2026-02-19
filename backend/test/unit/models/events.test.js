const mongoose = require('mongoose');
const Event = require('../../../models/events'); // path

// Mock the Event model
jest.mock('../../../models/events');

describe('Event Model (mocked) - Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks(); // reset mocks between tests
  });

  it('should create & save an event successfully', async () => {
    const fakeEvent = {
      _id: new mongoose.Types.ObjectId(),
      communityId: new mongoose.Types.ObjectId(),
      title: 'Community Meetup',
      description: 'A meetup for community members',
      location: 'Community Center',
      eventDate: new Date('2024-12-01'),
      eventTime: '18:00',
      bannerImage: 'http://example.com/event.jpg',
      attendees: [new mongoose.Types.ObjectId()],
      createdAt: new Date(),
    };

    Event.create.mockResolvedValue(fakeEvent);

    const result = await Event.create(fakeEvent);

    expect(result).toEqual(fakeEvent);
    expect(Event.create).toHaveBeenCalledWith(fakeEvent);
  });

  it('should fetch all events', async () => {
    const fakeEvents = [
      { _id: new mongoose.Types.ObjectId(), title: 'Event A', location: 'Location A' },
      { _id: new mongoose.Types.ObjectId(), title: 'Event B', location: 'Location B' },
    ];

    Event.find.mockResolvedValue(fakeEvents);

    const result = await Event.find();

    expect(result).toEqual(fakeEvents);
    expect(Event.find).toHaveBeenCalledTimes(1);
  });

  it('should fetch an event by ID', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const fakeEvent = { _id: eventId, title: 'Event X', location: 'Location X' };

    Event.findById.mockResolvedValue(fakeEvent);

    const result = await Event.findById(eventId);

    expect(result).toEqual(fakeEvent);
    expect(Event.findById).toHaveBeenCalledWith(eventId);
  });

  it('should update an event', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const updates = { title: 'Updated Event Title' };
    const updatedEvent = { _id: eventId, ...updates, location: 'Location Y' };

    Event.findByIdAndUpdate.mockResolvedValue(updatedEvent);

    const result = await Event.findByIdAndUpdate(eventId, updates, { new: true });

    expect(result).toEqual(updatedEvent);
    expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(eventId, updates, { new: true });
  });

  it('should delete an event', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const deletedEvent = { _id: eventId, title: 'Deleted Event', location: 'Location Z' };

    Event.findByIdAndDelete.mockResolvedValue(deletedEvent);

    const result = await Event.findByIdAndDelete(eventId);

    expect(result).toEqual(deletedEvent);
    expect(Event.findByIdAndDelete).toHaveBeenCalledWith(eventId);
  });

  it('should handle error when creating an event', async () => {
    const invalidEvent = { title: 'Invalid Event' }; // missing required fields

    Event.create.mockRejectedValue(new Error('Event validation failed'));

    await expect(Event.create(invalidEvent)).rejects.toThrow('Event validation failed');
    expect(Event.create).toHaveBeenCalledWith(invalidEvent);
  });
});
