const {
    createCommunity,
    getCommunities,
    getCommunityById,
    updateCommunity,
    deleteCommunity,
} = require("../controllers/communityController");


const sendEmail = require("../utils/sendEmail");
jest.mock("../utils/sendEmail");
const Community = require("../models/communities");

jest.mock("../models/communities");

// Mock Request & Response
const mockRequest = () => ({ body: {}, params: {}, files: {} });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Community Controller Unit Tests (with Cloudinary logic)", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    // CREATE
    it("should create a community (with images) successfully", async () => {
        req.body = {
            name: "Test Community",
            type: "Charity",
            mission: "Helping others",
            description: "Doing good",
            location: "Colombo",
            contact: { name: "Admin", email: "admin@test.com" },
            isPrivate: false,
            members: [],
            leader: "leader-id",
            established: new Date("2020-01-01")
        };
        req.files = {
            bannerImage: [{ path: "https://res.cloudinary.com/test/banner.jpg" }],
            profileImage: [{ path: "https://res.cloudinary.com/test/profile.jpg" }]
        };

        const mockCreated = { ...req.body, ...req.files, _id: "mock-id" };
        Community.create.mockResolvedValueOnce(mockCreated);

        await createCommunity(req, res);

        expect(Community.create).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Community created successfully",
            data: mockCreated
        });
    });

    it("should send an email after community creation", async () => {
        req.body = {
            name: "Galle Volunteers Network",
            type: "Community Service",
            mission: "Connect volunteers with local NGOs and projects",
            description: "Youth volunteering network",
            contact: { name: "Chamodi Silva", email: "info@gallevolunteers.lk" },
            isPrivate: false,
        };

        // No files in this case
        req.files = {};

        const mockCreated = { ...req.body, _id: "mock-id" };
        Community.create.mockResolvedValueOnce(mockCreated);
        sendEmail.mockResolvedValueOnce(true); // Simulate successful email send

        await createCommunity(req, res);

        expect(Community.create).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalledWith(
            "info@gallevolunteers.lk",
            expect.stringContaining("Community Created Successfully"),
            expect.any(String),
            expect.any(String)
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });


    it("should handle validation error during create", async () => {
        const mockError = new Error("Validation failed");
        mockError.name = "ValidationError";
        Community.create.mockRejectedValueOnce(mockError);

        await createCommunity(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Validation failed",
            details: "Validation failed"
        });
    });

    it("should handle duplicate key error during create", async () => {
        const dupError = { code: 11000, message: "Duplicate field" };
        Community.create.mockRejectedValueOnce(dupError);

        await createCommunity(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Duplicate field value",
            details: "Duplicate field"
        });
    });

    // READ ALL
    it("should fetch all communities", async () => {
        const mockCommunities = [
            { _id: "1", name: "A" },
            { _id: "2", name: "B" }
        ];
        Community.find.mockResolvedValueOnce(mockCommunities);

        await getCommunities(req, res);

        expect(Community.find).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Communities fetched successfully",
            data: mockCommunities
        });
    });

    // READ ONE
    it("should fetch community by ID", async () => {
        req.params.id = "1";
        const mockCommunity = { _id: "1", name: "Test" };
        Community.findById.mockResolvedValueOnce(mockCommunity);

        await getCommunityById(req, res);

        expect(Community.findById).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockCommunity
        });
    });

    it("should return 404 if community not found", async () => {
        req.params.id = "1";
        Community.findById.mockResolvedValueOnce(null);

        await getCommunityById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Community not found"
        });
    });

    // UPDATE
    it("should update community and handle image upload", async () => {
        req.params.id = "1";
        req.body = { name: "Updated" };
        req.files = {
            bannerImage: [{ path: "https://res.cloudinary.com/test/new-banner.jpg" }]
        };
        const updated = { _id: "1", name: "Updated", bannerImage: "https://res.cloudinary.com/test/new-banner.jpg" };

        Community.findByIdAndUpdate.mockResolvedValueOnce(updated);

        await updateCommunity(req, res);

        expect(Community.findByIdAndUpdate).toHaveBeenCalledWith(
            "1",
            expect.objectContaining({
                name: "Updated",
                bannerImage: "https://res.cloudinary.com/test/new-banner.jpg"
            }),
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Community updated successfully",
            data: updated
        });
    });

    it("should return 404 if updating non-existing community", async () => {
        req.params.id = "1";
        Community.findByIdAndUpdate.mockResolvedValueOnce(null);

        await updateCommunity(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Community not found"
        });
    });

    // DELETE
    it("should delete community successfully", async () => {
        req.params.id = "1";
        const deleted = { _id: "1", name: "Deleted" };
        Community.findByIdAndDelete.mockResolvedValueOnce(deleted);

        await deleteCommunity(req, res);

        expect(Community.findByIdAndDelete).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Community deleted successfully"
        });
    });

    it("should return 404 if delete target not found", async () => {
        req.params.id = "1";
        Community.findByIdAndDelete.mockResolvedValueOnce(null);

        await deleteCommunity(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Community not found"
        });
    });
});
