const authMiddleware = require("../../../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("authMiddleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it("should call next() with valid token", () => {
        req.headers.authorization = "Bearer valid-token";
        jwt.verify.mockReturnValue({ _id: "userId", role: "leader" });

        authMiddleware(req, res, next);

        expect(req.user).toEqual({ _id: "userId", role: "leader" });
        expect(next).toHaveBeenCalled();
    });

    it("should return 401 if token missing", () => {
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if token invalid", () => {
        req.headers.authorization = "Bearer invalid-token";
        jwt.verify.mockImplementation(() => { throw new Error("fail"); });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
        expect(next).not.toHaveBeenCalled();
    });
});
