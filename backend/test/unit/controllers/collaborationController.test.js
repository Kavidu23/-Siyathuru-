const { suggestCommunities } = require('../../../controllers/collaborationController');
const Community = require('../../../models/communities');

jest.mock('../../../models/communities');

const mockRequest = () => ({ params: {} });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Collaboration Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('should return 404 when base community is not found', async () => {
    req.params.communityId = 'missing-community';
    Community.findById.mockResolvedValueOnce(null);

    await suggestCommunities(req, res);

    expect(Community.findById).toHaveBeenCalledWith('missing-community');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Community not found',
    });
  });

  it('should return nearby suggested communities with same type', async () => {
    req.params.communityId = 'base-community';

    const baseCommunity = {
      _id: 'base-community',
      type: 'Volunteer',
      location: {
        coordinates: { latitude: 6.9271, longitude: 79.8612 },
      },
    };

    const candidates = [
      {
        _id: 'nearby-1',
        type: 'Volunteer',
        location: {
          coordinates: { latitude: 6.93, longitude: 79.87 },
        },
      },
      {
        _id: 'far-1',
        type: 'Volunteer',
        location: {
          coordinates: { latitude: 7.2906, longitude: 80.6337 },
        },
      },
      {
        _id: 'missing-coordinates',
        type: 'Volunteer',
        location: {},
      },
    ];

    Community.findById.mockResolvedValueOnce(baseCommunity);
    Community.find.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(candidates),
    });

    await suggestCommunities(req, res);

    expect(Community.findById).toHaveBeenCalledWith('base-community');
    expect(Community.find).toHaveBeenCalledWith({
      _id: { $ne: 'base-community' },
      type: 'Volunteer',
      'location.coordinates.latitude': { $exists: true },
      'location.coordinates.longitude': { $exists: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Suggested communities fetched successfully',
      data: [candidates[0]],
    });
  });

  it('should return 500 on unexpected error', async () => {
    req.params.communityId = 'base-community';
    Community.findById.mockRejectedValueOnce(new Error('DB failure'));

    await suggestCommunities(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server error',
      details: 'DB failure',
    });
  });
});
