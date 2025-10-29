const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

jest.mock("../models/user"); // Mock Mongoose model
jest.mock("bcryptjs");       // Mock bcrypt
// Mock the sendEmail module
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));
const sendEmail = require('../utils/sendEmail'); // now this is a mocked function


// Helpers to create fake req/res
const mockRequest = () => ({ body: {}, params: {} });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();

    // Mock bcrypt functions
    bcrypt.hash.mockResolvedValue("hashed-password");
    bcrypt.compare.mockResolvedValue(true);
  });

  // CREATE USER
  it("should create a user and return 201 status", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      pnumber: "1234567890",
      password: "password123",
      location: {
        coordinates: { latitude: 7.1, longitude: 80.8 }
      },
      age: 25,
      role: "member",
    };
    req.body = userData;

    User.create.mockResolvedValueOnce({ ...userData, password: "hashed-password", _id: "fake-id" });

    await createUser(req, res);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...userData,
        password: "hashed-password",
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User created successfully. Please check your email for verification code.",
      data: {
        _id: "fake-id",
        name: userData.name,
        email: userData.email,
        pnumber: userData.pnumber,
        location: {
          coordinates: { latitude: 7.1, longitude: 80.8 }
        },
        age: userData.age,
        role: userData.role,
      },
    });
  });

  it("should return 400 if validation fails on create", async () => {
    const mockError = new Error("Validation failed");
    mockError.name = "ValidationError";
    User.create.mockRejectedValueOnce(mockError);

    await createUser(req, res);

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Validation failed",
      details: "Validation failed",
    });
  });

  it("should return 400 if duplicate field error occurs", async () => {
    const duplicateError = { code: 11000, message: "duplicate key error" };
    User.create.mockRejectedValueOnce(duplicateError);

    await createUser(req, res);

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Duplicate field value",
      details: "duplicate key error",
    });
  });

  // LOGIN USER
  it("should login a user and return 200 status", async () => {
    const loginData = { email: "test@gmail.com", password: "password123" };
    req.body = loginData;

    const mockUser = {
      _id: "fake-id",
      name: "Test User",
      email: "test@gmail.com",
      password: "hashed-password",
      pnumber: "123456789",
      location: {
        coordinates: { latitude: 7.1, longitude: 80.8 }
      },
      age: 25,
      role: "user",
    };

    User.findOne.mockResolvedValueOnce(mockUser);

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        pnumber: mockUser.pnumber,
        location: {
          coordinates: { latitude: 7.1, longitude: 80.8 }
        },
        age: mockUser.age,
        role: mockUser.role,
      },
    });
  });

  // READ ALL USERS
  // LOGIN USER
  it("should login a user and return 200 status", async () => {
    const loginData = { email: "test@gmail.com", password: "password123" };
    req.body = loginData;

    const mockUser = {
      _id: "fake-id",
      name: "Test User",
      email: "test@gmail.com",
      password: "hashed-password",
      pnumber: "123456789",
      location: {
        coordinates: { latitude: 7.1, longitude: 80.8 }
      },
      age: 25,
      role: "user",
    };

    User.findOne.mockResolvedValueOnce(mockUser);

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        pnumber: mockUser.pnumber,
        location: mockUser.location, // updated to match controller
        age: mockUser.age,
        role: mockUser.role,
      },
    });
  });


  // READ ONE USER
  it("should fetch a user by ID", async () => {
    const mockUser = { _id: "1", name: "User 1" };
    req.params.id = "1";
    User.findById.mockResolvedValueOnce(mockUser);

    await getUserById(req, res);

    expect(User.findById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
  });

  it("should return 404 if user not found by ID", async () => {
    req.params.id = "1";
    User.findById.mockResolvedValueOnce(null);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "User not found" });
  });

  // UPDATE USER
  it("should update a user successfully", async () => {
    const updatedData = { city: "New City" };
    const updatedUser = { _id: "1", name: "User 1", ...updatedData };
    req.params.id = "1";
    req.body = updatedData;

    User.findByIdAndUpdate.mockResolvedValueOnce(updatedUser);

    await updateUser(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("1", updatedData, { new: true, runValidators: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  });

  it("should return 404 if user to update not found", async () => {
    req.params.id = "1";
    req.body = { city: "New City" };
    User.findByIdAndUpdate.mockResolvedValueOnce(null);

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "User not found" });
  });

  // DELETE USER
  it("should delete a user successfully", async () => {
    const deletedUser = { _id: "1", name: "User 1" };
    req.params.id = "1";
    User.findByIdAndDelete.mockResolvedValueOnce(deletedUser);

    await deleteUser(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "User deleted successfully" });
  });

  it("should return 404 if user to delete not found", async () => {
    req.params.id = "1";
    User.findByIdAndDelete.mockResolvedValueOnce(null);

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "User not found" });
  });
});
