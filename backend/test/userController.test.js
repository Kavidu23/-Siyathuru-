const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const User = require("../models/user");

jest.mock("../models/user");

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
  });

  // CREATE
  it("should create a user and return 201 status", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      pnumber: "1234567890",
      password: "password123",
      city: "Test City",
      age: 25,
      role: "member",
    };
    req.body = userData;

    User.create.mockResolvedValueOnce({ ...userData, _id: "fake-id" });

    await createUser(req, res);

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith(userData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User created successfully",
      data: { ...userData, _id: "fake-id" },
    });
  });

  it("should return 400 status if validation fails on create", async () => {
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

  it("should return 400 status if duplicate email error occurs", async () => {
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

  // READ ALL
  it("should return all users with 200 status", async () => {
    const mockUsers = [
      { _id: "1", name: "User 1" },
      { _id: "2", name: "User 2" },
    ];
    User.find.mockResolvedValueOnce(mockUsers);

    await getUsers(req, res);

    expect(User.find).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Users fetched successfully",
      data: mockUsers,
    });
  });

  // READ ONE
  it("should fetch a user by ID", async () => {
    const mockUser = { _id: "1", name: "User 1" };
    req.params.id = "1";
    User.findById.mockResolvedValueOnce(mockUser);

    await getUserById(req, res);

    expect(User.findById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockUser,
    });
  });

  it("should return 404 if user not found by ID", async () => {
    req.params.id = "1";
    User.findById.mockResolvedValueOnce(null);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "User not found",
    });
  });

  // UPDATE
  it("should update a user successfully", async () => {
    const updatedData = { city: "New City" };
    const updatedUser = { _id: "1", name: "User 1", ...updatedData };
    req.params.id = "1";
    req.body = updatedData;

    User.findByIdAndUpdate.mockResolvedValueOnce(updatedUser);

    await updateUser(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      updatedData,
      { new: true, runValidators: true }
    );
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
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "User not found",
    });
  });

  // DELETE
  it("should delete a user successfully", async () => {
    const deletedUser = { _id: "1", name: "User 1" };
    req.params.id = "1";
    User.findByIdAndDelete.mockResolvedValueOnce(deletedUser);

    await deleteUser(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User deleted successfully",
    });
  });

  it("should return 404 if user to delete not found", async () => {
    req.params.id = "1";
    User.findByIdAndDelete.mockResolvedValueOnce(null);

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "User not found",
    });
  });
});
