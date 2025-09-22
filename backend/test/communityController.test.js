const {
    createCommunity,
    getCommunities,
    getCommunityById,
    updateCommunity,
    deleteCommunity,
} = require("../controllers/communityController");

const Community = require("../models/communities");

jest.mock("../models/communities");

const mockRequest = () => ({ body: {}, params: {} });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Community Controller Unit Tests", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    // CREATE
    it("should create a community and return 201 status", async () => {
        const communityData = {
            name: "Test Community",
            type: "Charity",
            mission: "Helping the community",
            description: "A community focused on charity work",
            bannerImage: "http://example.com/banner.jpg",
            profileImage: "http://example.com/profile.jpg",
            location: { address: "123 Main St", coordinates: { latitude: 40, longitude: -74 } },
            contact: { name: "Admin", phone: "1234567890", email: "admin@test.com" },
            isPrivate: false,
            members: [],
            leader: "leader-id",
            established: new Date("2020-01-01"),
        };
        req.body = communityData;

        Community.create.mockResolvedValueOnce({ ...communityData, _id: "fake-id" });

        await createCommunity(req, res);

        expect(Community.create).toHaveBeenCalledTimes(1);
        expect(Community.create).toHaveBeenCalledWith(communityData);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Community created successfully",
            data: { ...communityData, _id: "fake-id" },
        });
    });

    it("should return 400 if validation fails on create", async () => {
        const mockError = new Error("Validation failed");
        mockError.name = "ValidationError";
        Community.create.mockRejectedValueOnce(mockError);

        await createCommunity(req, res);

        expect(Community.create).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Validation failed",
            details: "Validation failed",
        });
    });

    it("should return 400 if duplicate field error occurs", async () => {
        const duplicateError = { code: 11000, message: "duplicate key error" };
        Community.create.mockRejectedValueOnce(duplicateError);

        await createCommunity(req, res);

        expect(Community.create).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Duplicate field value",
            details: "duplicate key error",
        });
    });

    // READ ALL
    it("should fetch all communities with 200 status", async () => {
        const mockCommunities = [
            { _id: "1", name: "Community A", type: "Sports" },
            { _id: "2", name: "Community B", type: "Youth Club" },
        ];
        Community.find.mockResolvedValueOnce(mockCommunities);

        await getCommunities(req, res);

        expect(Community.find).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Communities fetched successfully",
            data: mockCommunities,
        });
    });

    // READ ONE
    it("should fetch a community by ID", async () => {
        const mockCommunity = { _id: "1", name: "Community X", type: "Charity" };
        req.params.id = "1";
        Community.findById.mockResolvedValueOnce(mockCommunity);

        await getCommunityById(req, res);

        expect(Community.findById).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockCommunity,
        });
    });

    it("should return 404 if community not found by ID", async () => {
        req.params.id = "1";
        Community.findById.mockResolvedValueOnce(null);

        await getCommunityById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Community not found",
        });
    });

    // UPDATE
    it("should update a community successfully", async () => {
        const updatedData = { description: "Updated description" };
        const updatedCommunity = { _id: "1", name: "Community X", ...updatedData };
        req.params.id = "1";
        req.body = updatedData;

        Community.findByIdAndUpdate.mockResolvedValueOnce(updatedCommunity);

        await updateCommunity(req, res);

        expect(Community.findByIdAndUpdate).toHaveBeenCalledWith(
            "1",
            updatedData,
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Community updated successfully",
            data: updatedCommunity,
        });
    });

    it("should return 404 if community to update not found", async () => {
        req.params.id = "1";
        req.body = { description: "Updated description" };
        Community.findByIdAndUpdate.mockResolvedValueOnce(null);

        await updateCommunity(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Community not found",
        });
    });

    // DELETE
    it("should delete a community successfully", async () => {
        const deletedCommunity = { _id: "1", name: "Community X" };
        req.params.id = "1";
        Community.findByIdAndDelete.mockResolvedValueOnce(deletedCommunity);

        await deleteCommunity(req, res);

        expect(Community.findByIdAndDelete).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Community deleted successfully",
        });
    });

    it("should return 404 if community to delete not found", async () => {
        req.params.id = "1";
        Community.findByIdAndDelete.mockResolvedValueOnce(null);

        await deleteCommunity(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Community not found",
        });
    });
});
