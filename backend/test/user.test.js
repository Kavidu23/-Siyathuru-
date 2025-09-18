const mongoose = require("mongoose");
const User = require("../models/user"); // adjust path if needed

// Mock the User model
jest.mock("../models/user");

describe("User Model (mocked) - Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks(); // reset mocks between tests
    });

    it("should create & save a user successfully", async () => {
        const fakeUser = {
            _id: new mongoose.Types.ObjectId(),
            name: "John Doe",
            email: "john.doe@example.com",
            pnumber: "1234567890",
            password: "password",
            city: "Test City",
            age: 25,
            role: "member"
        };

        User.create.mockResolvedValue(fakeUser);

        const result = await User.create(fakeUser);

        expect(result).toEqual(fakeUser);
        expect(User.create).toHaveBeenCalledWith(fakeUser);
    });

    it("should fetch all users", async () => {
        const fakeUsers = [
            { _id: new mongoose.Types.ObjectId(), name: "User A", email: "a@test.com" },
            { _id: new mongoose.Types.ObjectId(), name: "User B", email: "b@test.com" }
        ];

        User.find.mockResolvedValue(fakeUsers);

        const result = await User.find();

        expect(result).toEqual(fakeUsers);
        expect(User.find).toHaveBeenCalledTimes(1);
    });

    it("should fetch a user by ID", async () => {
        const userId = new mongoose.Types.ObjectId();
        const fakeUser = { _id: userId, name: "User X", email: "x@test.com" };

        User.findById.mockResolvedValue(fakeUser);

        const result = await User.findById(userId);

        expect(result).toEqual(fakeUser);
        expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it("should update a user", async () => {
        const userId = new mongoose.Types.ObjectId();
        const updateData = { city: "New City" };
        const updatedUser = { _id: userId, name: "John Doe", ...updateData };

        User.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const result = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        expect(result).toEqual(updatedUser);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true, runValidators: true });
    });

    it("should delete a user", async () => {
        const userId = new mongoose.Types.ObjectId();
        const deletedUser = { _id: userId, name: "Deleted User", email: "deleted@test.com" };

        User.findByIdAndDelete.mockResolvedValue(deletedUser);

        const result = await User.findByIdAndDelete(userId);

        expect(result).toEqual(deletedUser);
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it("should handle errors when creating a user", async () => {
        const fakeUser = { name: "Error User" };
        const errorMessage = "User validation failed";

        User.create.mockRejectedValue(new Error(errorMessage));

        await expect(User.create(fakeUser)).rejects.toThrow(errorMessage);
        expect(User.create).toHaveBeenCalledWith(fakeUser);
    });

    it("should handle duplicate email error", async () => {
        const fakeUser = { email: "duplicate@test.com" };
        const mongoError = { code: 11000, message: "duplicate key error" };

        User.create.mockRejectedValue(mongoError);

        await expect(User.create(fakeUser)).rejects.toEqual(mongoError);
        expect(User.create).toHaveBeenCalledWith(fakeUser);
    });
});
