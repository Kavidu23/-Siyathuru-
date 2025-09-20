const mongoose = require('mongoose');
const Request = require('../models/requests'); // path

// Mock the Request model
jest.mock('../models/requests');

describe('Request Model (mocked) - Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks(); // reset mocks between tests
    });

    it('should create & save a request successfully', async () => {
        const fakeRequest = {
            _id: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            communityId: new mongoose.Types.ObjectId(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        Request.create.mockResolvedValue(fakeRequest);
        const result = await Request.create(fakeRequest);

        expect(result).toEqual(fakeRequest);
        expect(Request.create).toHaveBeenCalledWith(fakeRequest);
    });

    it('should fetch all requests', async () => {
        const fakeRequests = [
            { _id: new mongoose.Types.ObjectId(), userId: new mongoose.Types.ObjectId(), communityId: new mongoose.Types.ObjectId(), status: 'pending' },
            { _id: new mongoose.Types.ObjectId(), userId: new mongoose.Types.ObjectId(), communityId: new mongoose.Types.ObjectId(), status: 'approved' },
        ];
        Request.find.mockResolvedValue(fakeRequests);
        const result = await Request.find();

        expect(result).toEqual(fakeRequests);
        expect(Request.find).toHaveBeenCalledTimes(1);
    });

    it('should fetch a request by ID', async () => {
        const requestId = new mongoose.Types.ObjectId();
        const fakeRequest = { _id: requestId, userId: new mongoose.Types.ObjectId(), communityId: new mongoose.Types.ObjectId(), status: 'denied' };

        Request.findById.mockResolvedValue(fakeRequest);
        const result = await Request.findById(requestId);

        expect(result).toEqual(fakeRequest);
        expect(Request.findById).toHaveBeenCalledWith(requestId);
    });

    it('should update a request', async () => {
        const requestId = new mongoose.Types.ObjectId();
        const updateData = { status: 'approved' };
        const updatedRequest = { _id: requestId, userId: new mongoose.Types.ObjectId(), communityId: new mongoose.Types.ObjectId(), status: 'approved' };

        Request.findByIdAndUpdate.mockResolvedValue(updatedRequest);
        const result = await Request.findByIdAndUpdate(requestId, updateData, { new: true });

        expect(result).toEqual(updatedRequest);
        expect(Request.findByIdAndUpdate).toHaveBeenCalledWith(requestId, updateData, { new: true });
    });

    it('should delete a request', async () => {
        const requestId = new mongoose.Types.ObjectId();
        const deletedRequest = { _id: requestId, userId: new mongoose.Types.ObjectId(), communityId: new mongoose.Types.ObjectId(), status: 'pending' };

        Request.findByIdAndDelete.mockResolvedValue(deletedRequest);
        const result = await Request.findByIdAndDelete(requestId);

        expect(result).toEqual(deletedRequest);
        expect(Request.findByIdAndDelete).toHaveBeenCalledWith(requestId);
    });

    it('should handle error when creating a request', async () => {
        const errorMessage = 'Validation Error: userId is required';
        Request.create.mockRejectedValue(new Error(errorMessage));

        await expect(Request.create({})).rejects.toThrow(errorMessage);
        expect(Request.create).toHaveBeenCalledWith({});
    });
});
