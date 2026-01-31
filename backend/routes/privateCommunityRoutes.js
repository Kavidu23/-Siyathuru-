const express = require("express");
const router = express.Router();

const {
  joinCommunity,
  cancelJoinRequest,
  handleJoinRequest,
  getJoinRequests
} = require("../controllers/privateCommunityController");


router.post("/:id/join", joinCommunity);
router.delete("/:id/join", cancelJoinRequest);
router.post("/:id/requests/handle", handleJoinRequest);
router.get("/:id/requests", getJoinRequests);



module.exports = router;
