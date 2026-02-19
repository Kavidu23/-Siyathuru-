const mongoose = require('mongoose');
const Community = require('../../../models/communities'); // adjust path if needed

// Mock the Community model
jest.mock('../../../models/communities');

describe('Community Model (mocked) - Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks(); // reset mocks between tests
  });

  it('should create & save a community successfully', async () => {
    const fakeCommunity = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Community',
      type: 'Charity',
      mission: 'Helping the community',
      description: 'A community focused on charity work',
      bannerImage: 'http://example.com/banner.jpg',
      profileImage: 'http://example.com/profile.jpg',
      location: {
        address: '123 Main St',
        coordinates: { latitude: 40.7128, longitude: -74.006 },
      },
      contact: {
        name: 'Admin User',
        phone: '0781234567',
        email: 'admin@test.com',
      },
      isPrivate: false,
      members: [new mongoose.Types.ObjectId()],
      leader: new mongoose.Types.ObjectId(),
      established: new Date('2020-01-01'),
    };

    Community.create.mockResolvedValue(fakeCommunity);

    const result = await Community.create(fakeCommunity);

    expect(result).toEqual(fakeCommunity);
    expect(Community.create).toHaveBeenCalledWith(fakeCommunity);
  });

  it('should fetch all communities', async () => {
    const fakeCommunities = [
      { _id: new mongoose.Types.ObjectId(), name: 'Community A', type: 'Sports' },
      { _id: new mongoose.Types.ObjectId(), name: 'Community B', type: 'Youth Club' },
    ];

    Community.find.mockResolvedValue(fakeCommunities);

    const result = await Community.find();

    expect(result).toEqual(fakeCommunities);
    expect(Community.find).toHaveBeenCalledTimes(1);
  });

  it('should fetch a community by ID', async () => {
    const communityId = new mongoose.Types.ObjectId();
    const fakeCommunity = { _id: communityId, name: 'Community X', type: 'Charity' };

    Community.findById.mockResolvedValue(fakeCommunity);

    const result = await Community.findById(communityId);

    expect(result).toEqual(fakeCommunity);
    expect(Community.findById).toHaveBeenCalledWith(communityId);
  });

  it('should update a community', async () => {
    const communityId = new mongoose.Types.ObjectId();
    const updateData = { description: 'Updated description' };
    const updatedCommunity = { _id: communityId, name: 'Test Community', ...updateData };

    Community.findByIdAndUpdate.mockResolvedValue(updatedCommunity);

    const result = await Community.findByIdAndUpdate(communityId, updateData, { new: true });

    expect(result).toEqual(updatedCommunity);
    expect(Community.findByIdAndUpdate).toHaveBeenCalledWith(communityId, updateData, {
      new: true,
    });
  });

  it('should delete a community', async () => {
    const communityId = new mongoose.Types.ObjectId();
    const deletedCommunity = { _id: communityId, name: 'Deleted Community', type: 'Sports' };

    Community.findByIdAndDelete.mockResolvedValue(deletedCommunity);

    const result = await Community.findByIdAndDelete(communityId);

    expect(result).toEqual(deletedCommunity);
    expect(Community.findByIdAndDelete).toHaveBeenCalledWith(communityId);
  });

  it('should handle errors when creating a community', async () => {
    const fakeCommunity = { name: 'Error Community' };
    const errorMessage = 'Community validation failed';

    Community.create.mockRejectedValue(new Error(errorMessage));

    await expect(Community.create(fakeCommunity)).rejects.toThrow(errorMessage);
    expect(Community.create).toHaveBeenCalledWith(fakeCommunity);
  });
});
