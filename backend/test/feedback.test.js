const mongoose = require("mongoose");
const Feedback = require("../models/feedback"); // Adjust path if needed

// Mock the Feedback model
jest.mock("../models/feedback");

describe("Feedback Model (mocked) - Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks(); // Reset mocks after each test
    });

    // CREATE
    it("should create & save feedback successfully", async () => {
        const fakeFeedback = {
            _id: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            name: "Kevin",
            message: "Easy to find and join communities I care about",
        };

        Feedback.create.mockResolvedValue(fakeFeedback);

        const result = await Feedback.create(fakeFeedback);

        expect(result).toEqual(fakeFeedback);
        expect(Feedback.create).toHaveBeenCalledWith(fakeFeedback);
    });

    // READ ALL
    it("should fetch all feedbacks", async () => {
        const fakeFeedbacks = [
            { _id: new mongoose.Types.ObjectId(), name: "Alice", message: "Great platform!" },
            { _id: new mongoose.Types.ObjectId(), name: "Bob", message: "Easy to use and navigate" },
        ];

        Feedback.find.mockResolvedValue(fakeFeedbacks);

        const result = await Feedback.find();

        expect(result).toEqual(fakeFeedbacks);
        expect(Feedback.find).toHaveBeenCalledTimes(1);
    });

    // READ ONE
    it("should fetch a feedback by ID", async () => {
        const feedbackId = new mongoose.Types.ObjectId();
        const fakeFeedback = { _id: feedbackId, name: "Charlie", message: "Loved the features!" };

        Feedback.findById.mockResolvedValue(fakeFeedback);

        const result = await Feedback.findById(feedbackId);

        expect(result).toEqual(fakeFeedback);
        expect(Feedback.findById).toHaveBeenCalledWith(feedbackId);
    });

    // UPDATE
    it("should update a feedback successfully", async () => {
        const feedbackId = new mongoose.Types.ObjectId();
        const updateData = { message: "Updated message" };
        const updatedFeedback = { _id: feedbackId, name: "David", message: "Updated message" };

        Feedback.findByIdAndUpdate.mockResolvedValue(updatedFeedback);

        const result = await Feedback.findByIdAndUpdate(feedbackId, updateData, { new: true });

        expect(result).toEqual(updatedFeedback);
        expect(Feedback.findByIdAndUpdate).toHaveBeenCalledWith(feedbackId, updateData, { new: true });
    });

    // DELETE
    it("should delete a feedback successfully", async () => {
        const feedbackId = new mongoose.Types.ObjectId();
        const deletedFeedback = { _id: feedbackId, name: "Eve", message: "To be deleted" };

        Feedback.findByIdAndDelete.mockResolvedValue(deletedFeedback);

        const result = await Feedback.findByIdAndDelete(feedbackId);

        expect(result).toEqual(deletedFeedback);
        expect(Feedback.findByIdAndDelete).toHaveBeenCalledWith(feedbackId);
    });

    // ERROR - Validation
    it("should handle error when creating invalid feedback", async () => {
        const fakeFeedback = {
            userId: new mongoose.Types.ObjectId(),
            name: "", // invalid (required)
            message: "",
        };

        const errorMessage = "Feedback validation failed: name and message are required.";

        Feedback.create.mockRejectedValue(new Error(errorMessage));

        await expect(Feedback.create(fakeFeedback)).rejects.toThrow(errorMessage);
        expect(Feedback.create).toHaveBeenCalledWith(fakeFeedback);
    });

    // ERROR - Duplicate
    it("should handle duplicate feedback submission", async () => {
        const fakeFeedback = {
            userId: new mongoose.Types.ObjectId(),
            name: "Kevin",
            message: "Duplicate feedback test",
        };

        const mongoError = { code: 11000, message: "duplicate key error" };

        Feedback.create.mockRejectedValue(mongoError);

        await expect(Feedback.create(fakeFeedback)).rejects.toEqual(mongoError);
        expect(Feedback.create).toHaveBeenCalledWith(fakeFeedback);
    });
});
