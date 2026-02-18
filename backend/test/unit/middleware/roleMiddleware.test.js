const roleMiddleware = require("../../../middleware/roleMiddleware");

describe("roleMiddleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it("should call next if user role is allowed", () => {
        req.user.role = "leader";
        const middleware = roleMiddleware(["leader", "admin"]);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("should return 403 if user role is not allowed", () => {
        req.user.role = "member";
        const middleware = roleMiddleware(["leader"]);
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
        expect(next).not.toHaveBeenCalled();
    });
});
