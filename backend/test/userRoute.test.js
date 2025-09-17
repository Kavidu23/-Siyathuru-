// userRoute.test.js

const router = require("../routes/userRoutes"); // The file you want to test
const { createUser, getUsers } = require("../controllers/userController");

// Use Jest to mock the entire controller module.
// This is the key step to "unit" test the router.
jest.mock("../controllers/userController");

// --- Test Suite for User Router ---
describe("User Router Unit Tests", () => {
    // You don't need a full Express app or Supertest for this kind of unit test.
    // The goal is just to check if the router defines the paths correctly.

    // A utility function to inspect the router's internal layers.
    const findRoute = (route, method) => {
        return router.stack.find(s => {
            return s.route.path === route && s.route.methods[method.toLowerCase()];
        });
    };

    // Test 1: GET route is defined correctly.
    it("should define a GET / route that calls the getUsers controller", () => {
        const getRoute = findRoute("/", "get");
        
        // Assert that the route handler exists.
        expect(getRoute).toBeDefined();

        // Check if the handler function is indeed our mocked getUsers function.
        // This confirms the router is linked to the correct controller.
        expect(getRoute.route.stack[0].handle).toBe(getUsers);
    });

    // Test 2: POST route is defined correctly.
    it("should define a POST / route that calls the createUser controller", () => {
        const postRoute = findRoute("/", "post");

        // Assert that the route handler exists.
        expect(postRoute).toBeDefined();

        // Check that the handler function is the mocked createUser.
        expect(postRoute.route.stack[0].handle).toBe(createUser);
    });
});