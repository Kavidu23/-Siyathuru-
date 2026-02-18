const mongoose = require('mongoose');
const Alert = require("../../../models/alert"); // alert model path

// Mock the Alert model
jest.mock("../../../models/alert");

describe("Alert Model (mocked) - Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks(); // reset mocks between tests
    });

    it("should create & save an alert successfully", async () => {
        const fakeAlert = {
            _id: new mongoose.Types.ObjectId(),
            communityId: new mongoose.Types.ObjectId(),
            title: "Test Alert",
            message: "This is a test alert",
            severity: "info",
            isActive: true
        };
        Alert.create.mockResolvedValue(fakeAlert);

        const result = await Alert.create(fakeAlert);

        expect(result).toEqual(fakeAlert);
        expect(Alert.create).toHaveBeenCalledWith(fakeAlert);
    });

    it("should fetch all alerts", async () => {
        const fakeAlerts = [
            { _id: new mongoose.Types.ObjectId(), title: "Alert 1", message: "Message 1" },
            { _id: new mongoose.Types.ObjectId(), title: "Alert 2", message: "Message 2" }
        ];

        Alert.find.mockResolvedValue(fakeAlerts);

        const result = await Alert.find();

        expect(result).toEqual(fakeAlerts);
        expect(Alert.find).toHaveBeenCalledTimes(1);
    });

    it("should fetch an alert by ID", async () => {
        const alertId = new mongoose.Types.ObjectId();
        const fakeAlert = { _id: alertId, title: "Alert X", message: "Message X" };

        Alert.findById.mockResolvedValue(fakeAlert);

        const result = await Alert.findById(alertId);

        expect(result).toEqual(fakeAlert);
        expect(Alert.findById).toHaveBeenCalledWith(alertId);
    });

    it("should update an alert", async () => {
        const alertId = new mongoose.Types.ObjectId();
        const updateData = { severity: "critical" };
        const updatedAlert = { _id: alertId, title: "Alert Y", message: "Message Y", severity: "critical" };

        Alert.findByIdAndUpdate.mockResolvedValue(updatedAlert);

        const result = await Alert.findByIdAndUpdate(alertId, updateData, { new: true });

        expect(result).toEqual(updatedAlert);
        expect(Alert.findByIdAndUpdate).toHaveBeenCalledWith(alertId, updateData, { new: true });
    });

    it("should delete an alert", async () => {
        const alertId = new mongoose.Types.ObjectId();
        const deletedAlert = { _id: alertId, title: "Alert Z", message: "Message Z" };

        Alert.findByIdAndDelete.mockResolvedValue(deletedAlert);

        const result = await Alert.findByIdAndDelete(alertId);

        expect(result).toEqual(deletedAlert);
        expect(Alert.findByIdAndDelete).toHaveBeenCalledWith(alertId);
    });

    it("should handle error when creating an alert", async () => {
        const fakeAlert = {
            communityId: new mongoose.Types.ObjectId(),
            title: "Invalid Alert",
            message: "This alert has invalid severity",
            severity: "unknown" // invalid severity
        };
        const errorMessage = "Alert validation failed: severity: `unknown` is not a valid enum value for path `severity`.";

        Alert.create.mockRejectedValue(new Error(errorMessage));

        await expect(Alert.create(fakeAlert)).rejects.toThrow(errorMessage);
        expect(Alert.create).toHaveBeenCalledWith(fakeAlert);
    });

    it("should handle duplicate title error", async () => {
        const fakeAlert = {
            communityId: new mongoose.Types.ObjectId(),
            title: "Duplicate Alert",
            message: "This alert title already exists",
        };
        const mongoError = { code: 11000, message: "duplicate key error" };

        Alert.create.mockRejectedValue(mongoError);

        await expect(Alert.create(fakeAlert)).rejects.toEqual(mongoError);
        expect(Alert.create).toHaveBeenCalledWith(fakeAlert);
    });
});
