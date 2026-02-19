const {
  getAlerts,
  createAlert,
  getAlertById,
  updateAlert,
  deleteAlert,
} = require('../../../controllers/alertController');

const Alert = require('../../../models/alert');
const Community = require('../../../models/communities');
const sendEmail = require('../../../utils/sendEmail');

jest.mock('../../../models/alert');
jest.mock('../../../models/communities');
jest.mock('../../../utils/sendEmail', () => jest.fn());

// Fake req/res mocks
const mockRequest = () => ({ body: {}, params: {} });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Alert Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  it('should create an alert and return 201 status', async () => {
    const alertData = {
      communityId: 'community-id',
      title: 'Test Alert',
      message: 'This is a test alert',
      severity: 'high',
      isActive: true,
    };
    req.body = alertData;

    Alert.create.mockResolvedValueOnce({ ...alertData, _id: 'fake-id' });
    Community.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({
        members: [{ email: 'user1@test.com' }, { email: 'user2@test.com' }],
      }),
    });
    sendEmail.mockResolvedValueOnce();

    await createAlert(req, res);

    expect(Alert.create).toHaveBeenCalledWith(alertData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Alert created successfully',
      data: { ...alertData, _id: 'fake-id' },
    });
  });

  it('should return 400 if validation fails on create', async () => {
    const mockError = new Error('Validation failed');
    mockError.name = 'ValidationError';
    Alert.create.mockRejectedValueOnce(mockError);

    await createAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
      details: 'Validation failed',
    });
  });

  it('should return 400 if duplicate field value on create', async () => {
    const duplicateError = { code: 11000, message: 'duplicate key error' };
    Alert.create.mockRejectedValueOnce(duplicateError);

    await createAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Duplicate field value',
      details: 'duplicate key error',
    });
  });

  // ---------------- READ ALL ----------------
  it('should fetch all alerts with 200 status', async () => {
    const mockAlerts = [
      { _id: '1', title: 'Alert 1', message: 'Message 1', severity: 'low', isActive: true },
      { _id: '2', title: 'Alert 2', message: 'Message 2', severity: 'high', isActive: false },
    ];
    Alert.find.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(mockAlerts),
    });

    await getAlerts(req, res);

    expect(Alert.find).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Alerts fetched successfully',
      data: mockAlerts,
    });
  });

  // ---------------- READ BY ID ----------------
  it('should return 404 if alert not found by ID', async () => {
    req.params.id = '1';
    Alert.findById.mockResolvedValueOnce(null);

    await getAlertById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Alert not found',
    });
  });

  // ---------------- UPDATE ----------------
  it('should update an alert and return 200 status', async () => {
    const alertId = 'alert-id';
    const updateData = { title: 'Updated Alert', isActive: false };
    req.params.id = alertId;
    req.body = updateData;
    const updatedAlert = {
      _id: alertId,
      ...updateData,
      message: 'Existing message',
      severity: 'medium',
    };

    Alert.findByIdAndUpdate.mockResolvedValueOnce(updatedAlert);

    await updateAlert(req, res);

    expect(Alert.findByIdAndUpdate).toHaveBeenCalledWith(alertId, updateData, {
      new: true,
      runValidators: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Alert updated successfully',
      data: updatedAlert,
    });
  });

  it('should return 404 if alert to update not found', async () => {
    req.params.id = 'nonexistent-id';
    Alert.findByIdAndUpdate.mockResolvedValueOnce(null);

    await updateAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Alert not found',
    });
  });

  // ---------------- DELETE ----------------
  it('should delete an alert and return 200 status', async () => {
    req.params.id = 'alert-id';
    const deletedAlert = { _id: 'alert-id', title: 'Deleted Alert' };

    Alert.findByIdAndDelete.mockResolvedValueOnce(deletedAlert);

    await deleteAlert(req, res);

    expect(Alert.findByIdAndDelete).toHaveBeenCalledWith('alert-id');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Alert deleted successfully',
    });
  });

  it('should return 404 if alert to delete not found', async () => {
    req.params.id = 'nonexistent-id';
    Alert.findByIdAndDelete.mockResolvedValueOnce(null);

    await deleteAlert(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Alert not found',
    });
  });
});
