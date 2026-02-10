const express = require("express");
const router = express.Router();

const {
  requestVerification,
  verifyCommunity,
} = require("../controllers/communityVerificationController");

const authMiddleware = require("../middleware/authMiddleware");

// Validate code (does not mark as used)
router.post("/request", authMiddleware, requestVerification);

// Verify community and mark code as used
router.post("/verify", authMiddleware, verifyCommunity);

module.exports = router;
