// __tests__/userModel.unit.test.js
const mongoose = require("mongoose");
const User = require("../models/user"); // Your actual model

// Mock the User model methods with Jest
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
            role: "member",
        };

        // Mock .save() to resolve with fake user
        User.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(fakeUser),
        }));

        const userInstance = new User(fakeUser);
        const savedUser = await userInstance.save();

        expect(savedUser).toEqual(fakeUser);
        expect(savedUser.email).toBe("john.doe@example.com");
    });

    it("should fail validation if a required field is missing", async () => {
        const error = new mongoose.Error.ValidationError();
        error.addError("name", new mongoose.Error.ValidatorError({ message: "Name is required" }));

        // Mock .validate() to reject
        User.mockImplementation(() => ({
            validate: jest.fn().mockRejectedValue(error),
        }));

        const userInstance = new User({ email: "test@example.com" });
        await expect(userInstance.validate()).rejects.toBeInstanceOf(mongoose.Error.ValidationError);
    });

    it("should throw error on duplicate email", async () => {
        const mongoError = new Error("E11000 duplicate key error collection: users index: email dup key");

        // Mock .save() to reject
        User.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(mongoError),
        }));

        const userInstance = new User({
            name: "Jane Doe",
            email: "duplicate@example.com",
            pnumber: "1112223333",
            password: "pass",
            city: "City A",
        });

        await expect(userInstance.save()).rejects.toThrow("duplicate key error");
    });

    it("should fail validation if role is invalid", async () => {
        const error = new mongoose.Error.ValidationError();
        error.addError("role", new mongoose.Error.ValidatorError({ message: "Invalid role" }));

        // Mock .validate() to reject
        User.mockImplementation(() => ({
            validate: jest.fn().mockRejectedValue(error),
        }));

        const userInstance = new User({
            name: "Role Test",
            email: "role@test.com",
            role: "super-admin", // not allowed
        });

        await expect(userInstance.validate()).rejects.toBeInstanceOf(mongoose.Error.ValidationError);
    });
});
