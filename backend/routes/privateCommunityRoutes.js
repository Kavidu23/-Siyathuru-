const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // <--- Import it

const {
  joinCommunity,
  cancelJoinRequest,
  handleJoinRequest,
  getJoinRequests
} = require("../controllers/privateCommunityController");

// Apply authMiddleware to ALL routes in this file
router.use(authMiddleware);

router.post("/:id/join", joinCommunity);
router.delete("/:id/join", cancelJoinRequest);
router.post("/:id/requests/handle", handleJoinRequest);
router.get("/:id/requests", getJoinRequests);

module.exports = router;