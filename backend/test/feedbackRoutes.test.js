const express = require("express");
const router = require("../routes/feedbackRoutes"); // your feedback router
const { createFeedback, getFeedbacks } = require("../controllers/feedbackController");

jest.mock("../controllers/feedbackController");

describe("Feedback Routes Unit Tests", () => {
    // Utility function to find route by path & method
    const findRoute = (route, method) => {
        return router.stack.find(
            (s) => s.route?.path === route && s.route?.methods[method.toLowerCase()]
        );
    };

    it("should define POST / route -> createFeedback", () => {
        const route = findRoute("/", "post");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(createFeedback);
    });

    it("should define GET / route -> getFeedbacks", () => {
        const route = findRoute("/", "get");
        expect(route).toBeDefined();
        expect(route.route.stack[0].handle).toBe(getFeedbacks);
    });
});
