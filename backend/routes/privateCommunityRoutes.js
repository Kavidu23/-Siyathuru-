const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  joinCommunity,
  cancelJoinRequest,
  handleJoinRequest,
  getJoinRequests
} = require("../controllers/privateCommunityController");

// Apply authMiddleware to ALL routes
router.use(authMiddleware);

// Role shortcuts
const memberOnly = roleMiddleware(["member"]);
const leaderOnly = roleMiddleware(["leader"]);

// ===== Member-only routes =====
router.post("/:id/join", memberOnly, joinCommunity);
router.delete("/:id/join", memberOnly, cancelJoinRequest);

// ===== Leader-only routes =====
router.post("/:id/requests/handle", leaderOnly, handleJoinRequest);
router.get("/:id/requests", leaderOnly, getJoinRequests);

module.exports = router;