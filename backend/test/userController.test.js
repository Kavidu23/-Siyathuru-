const { createUser, getUsers } = require("../controllers/userController");
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

  it("should create a user and return 201 status", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      pnumber: "1234567890",
      password: "password123",
      city: "Test City",
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

  it("should return 400 status if validation fails", async () => {
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

  it("should return all users and 200 status", async () => {
    const mockUsers = [{ name: "User 1" }, { name: "User 2" }];
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
});
