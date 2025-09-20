const router = require("../routes/eventsRoutes"); // The router file

const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} = require("../controllers/eventsController");

// Mock the controller module
jest.mock("../controllers/eventsController");

// Utility to find route by path & method
const findRoute = (route, method) => {
    return router.stack.find(
        (s) => s.route.path === route && s.route.methods[method.toLowerCase()]
    );
};

describe("Events Router Unit Tests", () => {
    it("should define GET / route -> getEvents", () => {
        const route = findRoute("/", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getEvents);
    });
    it("should define POST / route -> createEvent", () => {
        const route = findRoute("/", "post");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(createEvent);
    }
    );
    it("should define GET /:id route -> getEventById", () => {
        const route = findRoute("/:id", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getEventById);
    });
    it("should define PUT /:id route -> updateEvent", () => {
        const route = findRoute("/:id", "put");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(updateEvent);
    }
    );
    it("should define DELETE /:id route -> deleteEvent", () => {
        const route = findRoute("/:id", "delete");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(deleteEvent);
    });
});

