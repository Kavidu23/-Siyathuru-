const {
  joinCommunity,
  cancelJoinRequest,
  handleJoinRequest,
  getJoinRequests,
} = require('../../../controllers/privateCommunityController');

const Community = require('../../../models/communities');
const User = require('../../../models/user');
const sendEmail = require('../../../utils/sendEmail');

jest.mock('../../../models/communities');
jest.mock('../../../models/user');
jest.mock('../../../utils/sendEmail', () => jest.fn());

const mockRequest = () => ({
  body: {},
  params: {},
  user: { id: 'user-1' },
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Private Community Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('should send join request for private community', async () => {
    req.params.id = 'community-1';
    Community.findById.mockResolvedValueOnce({
      _id: 'community-1',
      isPrivate: true,
      members: [],
      joinRequests: [],
    });
    Community.findByIdAndUpdate.mockResolvedValueOnce({});

    await joinCommunity(req, res);

    expect(Community.findById).toHaveBeenCalledWith('community-1');
    expect(Community.findByIdAndUpdate).toHaveBeenCalledWith('community-1', {
      $addToSet: { joinRequests: { user: 'user-1' } },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Join request sent. Awaiting approval.',
    });
  });

  it('should reject join request if already a member', async () => {
    req.params.id = 'community-1';
    Community.findById.mockResolvedValueOnce({
      isPrivate: true,
      members: [{ toString: () => 'user-1' }],
      joinRequests: [],
    });

    await joinCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'You are already a member',
    });
  });

  it('should cancel join request', async () => {
    req.params.id = 'community-1';
    Community.findByIdAndUpdate.mockResolvedValueOnce({ _id: 'community-1' });

    await cancelJoinRequest(req, res);

    expect(Community.findByIdAndUpdate).toHaveBeenCalledWith(
      'community-1',
      { $pull: { joinRequests: { user: 'user-1' } } },
      { new: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Join request cancelled',
    });
  });

  it('should return 404 when cancelling request for missing community', async () => {
    req.params.id = 'community-1';
    Community.findByIdAndUpdate.mockResolvedValueOnce(null);

    await cancelJoinRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Community not found',
    });
  });

  it('should approve join request by leader', async () => {
    req.params.id = 'community-1';
    req.user.id = 'leader-1';
    req.body = { userId: 'user-2', approve: true };

    Community.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({
        _id: 'community-1',
        name: 'Test Community',
        leader: { _id: { toString: () => 'leader-1' } },
      }),
    });
    User.findById.mockResolvedValueOnce({
      _id: 'user-2',
      name: 'Member User',
      email: 'member@test.com',
    });
    Community.findByIdAndUpdate.mockResolvedValue({});
    User.findByIdAndUpdate.mockResolvedValue({});
    sendEmail.mockResolvedValueOnce(true);

    await handleJoinRequest(req, res);

    expect(sendEmail).toHaveBeenCalledWith(
      'member@test.com',
      expect.stringContaining('Approved'),
      expect.any(String),
      expect.any(String),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Join request approved',
    });
  });

  it('should reject join request by leader', async () => {
    req.params.id = 'community-1';
    req.user.id = 'leader-1';
    req.body = { userId: 'user-2', approve: false };

    Community.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({
        _id: 'community-1',
        name: 'Test Community',
        leader: { _id: { toString: () => 'leader-1' } },
      }),
    });
    User.findById.mockResolvedValueOnce({
      _id: 'user-2',
      name: 'Member User',
      email: 'member@test.com',
    });
    Community.findByIdAndUpdate.mockResolvedValue({});
    sendEmail.mockResolvedValueOnce(true);

    await handleJoinRequest(req, res);

    expect(sendEmail).toHaveBeenCalledWith(
      'member@test.com',
      expect.stringContaining('Rejected'),
      expect.any(String),
      expect.any(String),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Join request rejected',
    });
  });

  it('should return 403 for non-leader handling request', async () => {
    req.params.id = 'community-1';
    req.user.id = 'not-leader';
    req.body = { userId: 'user-2', approve: true };

    Community.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({
        leader: { _id: { toString: () => 'leader-1' } },
      }),
    });

    await handleJoinRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Not authorized',
    });
  });

  it('should return join requests for leader', async () => {
    req.params.id = 'community-1';
    req.user.id = 'leader-1';

    const joinRequests = [{ user: { _id: 'u1', name: 'User 1' } }];
    Community.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({
        leader: { toString: () => 'leader-1' },
        joinRequests,
      }),
    });

    await getJoinRequests(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      joinRequests,
    });
  });
});
