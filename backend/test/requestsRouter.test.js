const router = require("../routes/requestsRoutes");

const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
} = require("../controllers/requestsController");

// Mock the controller module
jest.mock("../controllers/requestsController");

// Utility to find route by path & method
const findRoute = (route, method) => {
    return router.stack.find(
        (s) => s.route.path === route && s.route.methods[method.toLowerCase()]
    );
};

describe("Requests Router Unit Tests", () => {
    it("should define GET / route -> getRequests", () => {
        const route = findRoute("/", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getRequests);
    });
    it("should define POST / route -> createRequest", () => {
        const route = findRoute("/", "post");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(createRequest);
    }
    );
    it("should define GET /:id route -> getRequestById", () => {
        const route = findRoute("/:id", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getRequestById);
    });
    it("should define PUT /:id route -> updateRequest", () => {
        const route = findRoute("/:id", "put");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(updateRequest);
    }
    );
    it("should define DELETE /:id route -> deleteRequest", () => {
        const route = findRoute("/:id", "delete");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(deleteRequest);
    });
});


