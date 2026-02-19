const {
  requestPasswordReset,
  resetPassword,
} = require("../../../controllers/userPasswordController");
const User = require("../../../models/user");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../../utils/sendEmail");

jest.mock("../../../models/user");
jest.mock("bcryptjs");
jest.mock("../../../utils/sendEmail", () => jest.fn().mockResolvedValue(true));

const mockRequest = () => ({ body: {}, params: {} });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Password Controller Unit Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  it("requestPasswordReset returns 400 when email is missing", async () => {
    req.body = {};

    await requestPasswordReset(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Email is required",
    });
  });

  it("requestPasswordReset returns 200 and sends email for existing user", async () => {
    req.body = { email: "member@test.com" };
    const userDoc = {
      name: "Member",
      email: "member@test.com",
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValueOnce(userDoc);

    await requestPasswordReset(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "member@test.com" });
    expect(userDoc.save).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  });

  it("resetPassword returns 400 when token or password is missing", async () => {
    req.body = { token: "", password: "" };

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token and new password are required",
    });
  });

  it("resetPassword updates password and clears reset fields", async () => {
    req.body = { token: "valid-token", password: "newpass123" };
    const userDoc = {
      password: "old-hash",
      resetPasswordToken: "old-token",
      resetPasswordExpires: new Date(Date.now() + 1000),
      save: jest.fn().mockResolvedValue(true),
    };

    bcrypt.hash.mockResolvedValueOnce("new-hash");
    User.findOne.mockResolvedValueOnce(userDoc);

    await resetPassword(req, res);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith("newpass123", 10);
    expect(userDoc.password).toBe("new-hash");
    expect(userDoc.resetPasswordToken).toBeUndefined();
    expect(userDoc.resetPasswordExpires).toBeUndefined();
    expect(userDoc.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  });
});
