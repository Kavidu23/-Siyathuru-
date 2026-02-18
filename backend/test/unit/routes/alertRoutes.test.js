const express = require("express");
const router = require("../../../routes/alertRoutes"); // Import router directly

const {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
} = require("../../../controllers/alertController");

// Mock the controller module
jest.mock("../controllers/alertController");

// Utility to find route by path & method
const findRoute = (route, method) => {
    return router.stack.find(
        (s) =>
            s.route &&
            s.route.path === route &&
            s.route.methods[method.toLowerCase()]
    );
};

describe("Alert Router Unit Tests", () => {
    it("should define GET / route -> getAlerts", () => {
        const route = findRoute("/", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getAlerts);
    });

    it("should define POST / route -> createAlert", () => {
        const route = findRoute("/", "post");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(createAlert);
    });

    it("should define GET /:id route -> getAlertById", () => {
        const route = findRoute("/:id", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getAlertById);
    });

    it("should define PUT /:id route -> updateAlert", () => {
        const route = findRoute("/:id", "put");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(updateAlert);
    });

    it("should define DELETE /:id route -> deleteAlert", () => {
        const route = findRoute("/:id", "delete");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(deleteAlert);
    });
});
