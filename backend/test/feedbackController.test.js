const { createFeedback, getFeedbacks } = require("../controllers/feedbackController");
const Feedback = require("../models/feedback");

jest.mock("../models/feedback");

// Mock Request & Response
const mockRequest = () => ({ body: {}, params: {}, files: {} });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Feedback Controller Unit Tests", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    // ✅ CREATE FEEDBACK
    it("should create feedback successfully", async () => {
        req.body = {
            userId: "67102f3e7a48c2e1d9a1b111",
            name: "Kevin",
            message: "Awesome platform!"
        };

        const fakeFeedback = { _id: "67102f3e7a48c2e1d9a1b999", ...req.body };

        Feedback.create.mockResolvedValue(fakeFeedback);

        await createFeedback(req, res);

        expect(Feedback.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Feedback submitted successfully",
            data: fakeFeedback
        });
    });

    it("should return 400 if required fields are missing", async () => {
        req.body = { name: "Kevin" }; // missing userId & message

        await createFeedback(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "All fields (userId, name, message) are required"
        });
    });

    // ✅ GET ALL FEEDBACKS
    it("should fetch all feedbacks successfully", async () => {
        const fakeFeedbacks = [
            { _id: "1", name: "Alice", message: "Great work!" },
            { _id: "2", name: "Bob", message: "Loved it!" }
        ];

        Feedback.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeFeedbacks)
        });

        await getFeedbacks(req, res);

        expect(Feedback.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Feedbacks fetched successfully",
            data: fakeFeedbacks
        });
    });


    it("should handle errors when fetching all feedbacks", async () => {
        // Mock find to throw error
        Feedback.find.mockImplementation(() => { throw new Error("Database error"); });

        await getFeedbacks(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Server error",
            details: "Database error"
        });
    });
});
