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

describe("Community Controller Unit Tests (with nested objects)", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    // ✅ CREATE COMMUNITY
    it("should create a community (with nested objects and images) successfully", async () => {
        req.body = {
            name: "Youth Empowerment Forum",
            type: "Youth Club",
            mission: "Empower young leaders",
            description: "A place for youth leadership programs",
            location: {
                address: "Colombo 07, Sri Lanka",
                coordinates: { latitude: 6.9271, longitude: 79.8612 }
            },
            contact: {
                name: "Nimal Perera",
                phone: "+94771234567",
                email: "nimal@yef.lk"
            },
            media: {
                facebook: "https://facebook.com/yef",
                instagram: "https://instagram.com/yef",
                whatsapp: "https://wa.me/94771234567"
            },
            isPrivate: false,
            members: [],
            leader: "leader-id",
            established: new Date("2021-01-01")
        };

        req.files = {
            bannerImage: [{ path: "https://res.cloudinary.com/test/banner.jpg" }],
            profileImage: [{ path: "https://res.cloudinary.com/test/profile.jpg" }]
        };

        const mockCreated = { ...req.body, bannerImage: req.files.bannerImage[0].path, profileImage: req.files.profileImage[0].path, _id: "mock-id" };
        Community.create.mockResolvedValueOnce(mockCreated);

        await createCommunity(req, res);

        expect(Community.create).toHaveBeenCalledWith(expect.objectContaining({
            name: "Youth Empowerment Forum",
            type: "Youth Club",
            mission: "Empower young leaders",
            bannerImage: "https://res.cloudinary.com/test/banner.jpg",
            profileImage: "https://res.cloudinary.com/test/profile.jpg",
            location: expect.any(Object),
            contact: expect.any(Object),
            media: expect.any(Object),
        }));

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
            media: { facebook: "https://fb.com/gvn" },
            isPrivate: false,
        };
        req.files = {};

        const mockCreated = { ...req.body, _id: "mock-id" };
        Community.create.mockResolvedValueOnce(mockCreated);
        sendEmail.mockResolvedValueOnce(true);

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

    // ✅ READ ALL
    it("should fetch all communities", async () => {
        const mockCommunities = [
            { _id: "1", name: "A", type: "Youth Club" },
            { _id: "2", name: "B", type: "Charity" }
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

    // ✅ READ ONE
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

    // ✅ UPDATE
    it("should update community and handle image upload", async () => {
        req.params.id = "1";
        req.body = {
            name: "Updated Community",
            contact: { name: "Updated Admin", email: "updated@test.com" },
            media: { facebook: "https://fb.com/updated" }
        };
        req.files = {
            bannerImage: [{ path: "https://res.cloudinary.com/test/new-banner.jpg" }]
        };

        const updated = {
            _id: "1",
            name: "Updated Community",
            bannerImage: "https://res.cloudinary.com/test/new-banner.jpg"
        };

        Community.findByIdAndUpdate.mockResolvedValueOnce(updated);

        await updateCommunity(req, res);

        expect(Community.findByIdAndUpdate).toHaveBeenCalledWith(
            "1",
            expect.objectContaining({
                name: "Updated Community",
                bannerImage: "https://res.cloudinary.com/test/new-banner.jpg"
            }),
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
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

    // ✅ DELETE
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
