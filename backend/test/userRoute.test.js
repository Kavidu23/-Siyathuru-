// userRoute.test.js

const router = require("../routes/userRoutes"); // The router file
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/userController");

// Mock the controller module
jest.mock("../controllers/userController");

// Utility to find route by path & method
const findRoute = (route, method) => {
    return router.stack.find(
        (s) => s.route.path === route && s.route.methods[method.toLowerCase()]
    );
};

describe("User Router Unit Tests", () => {
    it("should define GET / route -> getUsers", () => {
        const route = findRoute("/", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getUsers);
    });

    it("should define POST / route -> createUser", () => {
        const route = findRoute("/", "post");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(createUser);
    });

    it("should define GET /:id route -> getUserById", () => {
        const route = findRoute("/:id", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getUserById);
    });

    it("should define PUT /:id route -> updateUser", () => {
        const route = findRoute("/:id", "put");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(updateUser);
    });

    it("should define DELETE /:id route -> deleteUser", () => {
        const route = findRoute("/:id", "delete");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(deleteUser);
    });
});
