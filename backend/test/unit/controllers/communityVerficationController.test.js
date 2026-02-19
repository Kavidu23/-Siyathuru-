jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const fs = require('fs').promises;
const Community = require('../../../models/communities');
const {
  requestVerification,
  verifyCommunity,
} = require('../../../controllers/communityVerificationController');

jest.mock('../../../models/communities');

const mockRequest = () => ({ body: {}, params: {} });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Community Verification Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('should return 400 when communityId is missing in requestVerification', async () => {
    req.body = { registrationCode: 123456 };

    await requestVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'communityId required',
    });
  });

  it('should return 200 when verification code is valid', async () => {
    req.body = { communityId: 'community-1', registrationCode: 123456 };
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify([{ communityId: 'community-1', registrationCode: 123456, usage: 'Unused' }]),
    );

    await requestVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Verification code is valid',
      data: { communityId: 'community-1', usage: 'Unused' },
    });
  });

  it('should return 400 when code was already used', async () => {
    req.body = { communityId: 'community-1', registrationCode: 123456 };
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify([{ communityId: 'community-1', registrationCode: 123456, usage: 'Used' }]),
    );

    await requestVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Registration code already used',
    });
  });

  it('should return 404 when registry entry is missing', async () => {
    req.body = { communityId: 'community-404', registrationCode: 123456 };
    fs.readFile.mockResolvedValueOnce(JSON.stringify([]));

    await requestVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Community ID not found in registry',
    });
  });

  it('should verify community and mark code as used', async () => {
    req.body = { communityId: 'community-1', registrationCode: 123456 };
    const mockCommunity = {
      _id: 'community-1',
      isVerified: false,
      save: jest.fn().mockResolvedValueOnce(true),
    };
    Community.findById.mockResolvedValueOnce(mockCommunity);
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify([{ communityId: 'community-1', registrationCode: 123456, usage: 'Unused' }]),
    );
    fs.writeFile.mockResolvedValueOnce();

    await verifyCommunity(req, res);

    expect(Community.findById).toHaveBeenCalledWith('community-1');
    expect(mockCommunity.save).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Community verified successfully',
      data: { communityId: 'community-1', isVerified: true },
    });
  });

  it('should return 400 when verifyCommunity is called with invalid code', async () => {
    req.body = { communityId: 'community-1', registrationCode: 999999 };
    Community.findById.mockResolvedValueOnce({
      _id: 'community-1',
      isVerified: false,
      save: jest.fn(),
    });
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify([{ communityId: 'community-1', registrationCode: 123456, usage: 'Unused' }]),
    );

    await verifyCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid registration code',
    });
  });
});
