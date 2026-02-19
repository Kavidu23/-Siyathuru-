const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../../../controllers/eventsController');

const Event = require('../../../models/events');
const sendEmail = require('../../../utils/sendEmail');

// Mock the controller module
jest.mock('../../../models/events');
jest.mock('../../../utils/sendEmail', () => jest.fn());

const mockRequest = () => ({ body: {}, params: {} });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Events Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // CREATE
  it('should create an event and return 201 status', async () => {
    const eventData = {
      communityId: 'community-id',
      title: 'Test Event',
      description: 'This is a test event',
      location: '123 Event St',
      eventDate: new Date('2024-12-31'),
      eventTime: '18:00',
      bannerImage: 'http://example.com/event.jpg',
      attendees: [],
    };
    req.body = eventData;

    Event.create.mockResolvedValueOnce({ ...eventData, _id: 'fake-event-id' });

    await createEvent(req, res);

    expect(Event.create).toHaveBeenCalledWith(eventData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Event created successfully',
      data: { ...eventData, _id: 'fake-event-id' },
    });
  });

  // READ ALL
  it('should retrieve all events and return 200 status', async () => {
    const mockEvents = [
      { _id: '1', title: 'Event One', communityId: 'community1' },
      { _id: '2', title: 'Event Two', communityId: 'community2' },
    ];

    Event.find.mockResolvedValueOnce(mockEvents);

    await getEvents(req, res);

    expect(Event.find).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Events fetched successfully',
      data: mockEvents,
    });
  });

  // READ ONE
  it('should fetch an event by ID', async () => {
    const mockEvent = { _id: '1', title: 'Event X' };
    req.params.id = '1';

    Event.findById.mockResolvedValueOnce(mockEvent);

    await getEventById(req, res);

    expect(Event.findById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockEvent,
    });
  });

  it('should return 404 if event not found by ID', async () => {
    req.params.id = '1';
    Event.findById.mockResolvedValueOnce(null);

    await getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Event not found',
    });
  });

  // UPDATE
  it('should update an event successfully', async () => {
    const updatedData = { description: 'Updated event desc' };
    const updatedEvent = { _id: '1', title: 'Event X', ...updatedData };
    req.params.id = '1';
    req.body = updatedData;

    Event.findByIdAndUpdate.mockResolvedValueOnce(updatedEvent);

    await updateEvent(req, res);

    expect(Event.findByIdAndUpdate).toHaveBeenCalledWith('1', updatedData, {
      new: true,
      runValidators: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  });

  it('should return 404 if event to update not found', async () => {
    req.params.id = '1';
    req.body = { description: 'Updated' };
    Event.findByIdAndUpdate.mockResolvedValueOnce(null);

    await updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Event not found',
    });
  });

  // DELETE
  it('should delete an event successfully', async () => {
    const foundEvent = {
      _id: '1',
      title: 'Event Y',
      eventDate: new Date('2025-01-01'),
      eventTime: '10:00',
      location: 'Colombo',
      communityId: { name: 'Community A' },
      attendees: [{ email: 'a@test.com' }, { email: 'b@test.com' }],
    };
    req.params.id = '1';
    const secondPopulate = jest.fn().mockResolvedValueOnce(foundEvent);
    const firstPopulate = jest.fn().mockReturnValueOnce({ populate: secondPopulate });
    Event.findById.mockReturnValueOnce({ populate: firstPopulate });
    Event.findByIdAndDelete.mockResolvedValueOnce({ _id: '1' });
    sendEmail.mockResolvedValue(true);

    await deleteEvent(req, res);

    expect(Event.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Event deleted successfully & notifications sent',
    });
  });

  it('should return 404 if event to delete not found', async () => {
    req.params.id = '1';
    const secondPopulate = jest.fn().mockResolvedValueOnce(null);
    const firstPopulate = jest.fn().mockReturnValueOnce({ populate: secondPopulate });
    Event.findById.mockReturnValueOnce({ populate: firstPopulate });

    await deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Event not found',
    });
  });
});
