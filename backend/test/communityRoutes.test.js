const router = require("../routes/communityRoutes"); // The router file
const {
    createCommunity,
    getCommunities,
    getCommunityById,
    updateCommunity,
    deleteCommunity,
} = require("../controllers/communityController");

// Mock the controller module
jest.mock("../controllers/communityController");

// Utility to find route by path & method
const findRoute = (route, method) => {
    return router.stack.find(
        (s) => s.route.path === route && s.route.methods[method.toLowerCase()]
    );
};

describe("Community Router Unit Tests", () => {
    it("should define GET / route -> getCommunities", () => {
        const route = findRoute("/", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getCommunities);
    });

    it("should define POST / route -> createCommunity", () => {
        const route = findRoute("/", "post");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(createCommunity);
    });

    it("should define GET /:id route -> getCommunityById", () => {
        const route = findRoute("/:id", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getCommunityById);
    });

    it("should define PUT /:id route -> updateCommunity", () => {
        const route = findRoute("/:id", "put");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(updateCommunity);
    });

    it("should define DELETE /:id route -> deleteCommunity", () => {
        const route = findRoute("/:id", "delete");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(deleteCommunity);
    });
});
